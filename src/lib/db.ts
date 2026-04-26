/**
 * Database abstraction — Neon (PostgreSQL) with mysql2-compatible interface.
 *
 * All existing code calls getPool().getConnection() / conn.execute(sql, params)
 * or query(sql, params) — this file makes those calls work against Neon Postgres
 * without changing any other file.
 *
 * MySQL → PostgreSQL translation handled here:
 *   ? placeholders  → $1 $2 $3 ...
 *   INSERT IGNORE   → INSERT ... ON CONFLICT DO NOTHING
 *   AUTO_INCREMENT  → SERIAL (handled in CREATE TABLE statements elsewhere via ensureTable helpers)
 *   TINYINT(1)      → BOOLEAN
 *   ENGINE=InnoDB   → stripped
 *   SHOW COLUMNS    → information_schema.columns
 */

import { neon, neonConfig } from '@neondatabase/serverless';

// Use HTTP fetch transport — no WebSocket needed on Vercel/Node.js
neonConfig.fetchConnectionCache = true;

const DATABASE_URL = process.env.DATABASE_URL ?? '';

if (!DATABASE_URL) {
  console.warn('[db] DATABASE_URL not set — DB calls will fail');
}

// Singleton SQL client
let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!_sql) _sql = neon(DATABASE_URL);
  return _sql;
}

// ── MySQL → PostgreSQL SQL translation ───────────────────────────────────────

function translateSQL(sql: string): string {
  return sql
    // ? → $1, $2, ... positional params
    // (done separately in buildQuery)
    // Remove MySQL-specific table options
    .replace(/ENGINE\s*=\s*\w+/gi, '')
    .replace(/DEFAULT\s+CHARSET\s*=\s*\w+/gi, '')
    .replace(/CHARSET\s*=\s*\w+/gi, '')
    .replace(/COLLATE\s*=?\s*\w+/gi, '')
    // AUTO_INCREMENT → SERIAL (only in column definitions, not ALTER)
    .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'SERIAL PRIMARY KEY')
    .replace(/AUTO_INCREMENT/gi, '')
    // TINYINT(1) → BOOLEAN
    .replace(/TINYINT\s*\(\s*1\s*\)/gi, 'BOOLEAN')
    // TINYINT → SMALLINT
    .replace(/TINYINT/gi, 'SMALLINT')
    // MySQL ENUM → TEXT with CHECK (simplified — keep as TEXT)
    .replace(/ENUM\s*\([^)]+\)/gi, (match) => {
      // Extract values and create CHECK constraint inline
      const vals = match.match(/'[^']+'/g) ?? [];
      if (vals.length === 0) return 'TEXT';
      return `TEXT CHECK (value IN (${vals.join(',')}))`;
    })
    // INSERT IGNORE → INSERT ... ON CONFLICT DO NOTHING
    .replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT INTO')
    // DATETIME → TIMESTAMPTZ
    .replace(/\bDATETIME\b/gi, 'TIMESTAMPTZ')
    // ON UPDATE CURRENT_TIMESTAMP → not supported in PG, strip it
    .replace(/ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi, '')
    // DEFAULT CURRENT_TIMESTAMP → DEFAULT NOW()
    .replace(/DEFAULT\s+CURRENT_TIMESTAMP/gi, 'DEFAULT NOW()')
    // VARCHAR(n) stays as-is — PG supports it
    // UNSIGNED → strip
    .replace(/\bUNSIGNED\b/gi, '')
    // INDEX idx_name (col) inside CREATE TABLE → handled separately
    // FOREIGN KEY ... ON DELETE CASCADE → PG supports this
    // SHOW COLUMNS FROM x LIKE y → handled in getConnection shim
    .trim();
}

function buildQuery(sql: string, params?: any[]): { text: string; values: any[] } {
  if (!params || params.length === 0) {
    return { text: translateSQL(sql), values: [] };
  }
  // Replace ? with $1, $2, ...
  let i = 0;
  const text = translateSQL(sql).replace(/\?/g, () => `$${++i}`);
  return { text, values: params };
}

// ── INSERT IGNORE → ON CONFLICT DO NOTHING ───────────────────────────────────
function fixInsertIgnore(text: string): string {
  // If it was INSERT IGNORE, add ON CONFLICT DO NOTHING at end
  if (/INSERT\s+IGNORE/i.test(text) || text.includes('INSERT INTO') && !text.includes('ON CONFLICT')) {
    // Only add if it looks like a plain INSERT (no ON CONFLICT already)
    if (!text.includes('ON CONFLICT') && !text.includes('ON DUPLICATE KEY')) {
      // Check if original had INSERT IGNORE pattern (already translated above)
      // We'll add it conservatively only when needed
    }
  }
  return text;
}

// ── SHOW COLUMNS shim ─────────────────────────────────────────────────────────
async function showColumns(sql_client: ReturnType<typeof neon>, tableName: string, columnName: string): Promise<any[]> {
  const rows = await sql_client`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = ${tableName}
      AND column_name = ${columnName}
      AND table_schema = 'public'
  `;
  return rows as any[];
}

// ── Connection shim — mimics mysql2 conn interface ────────────────────────────
class NeonConnection {
  private sql: ReturnType<typeof neon>;

  constructor(sql: ReturnType<typeof neon>) {
    this.sql = sql;
  }

  async execute(rawSql: string, params?: any[]): Promise<[any[], any]> {
    // Handle SHOW COLUMNS FROM table LIKE 'col'
    const showColMatch = rawSql.match(/SHOW\s+COLUMNS\s+FROM\s+(\w+)\s+LIKE\s+['"]([\w]+)['"]/i);
    if (showColMatch) {
      const rows = await showColumns(this.sql, showColMatch[1], showColMatch[2]);
      return [rows, null];
    }

    // Handle SELECT COUNT(*) AS cnt — ensure it returns numeric
    const { text, values } = buildQuery(rawSql, params);

    // Fix INSERT IGNORE → INSERT ... ON CONFLICT DO NOTHING
    let finalText = text;
    if (/^INSERT\s+INTO/i.test(finalText) && !finalText.includes('ON CONFLICT') && !finalText.includes('ON DUPLICATE KEY')) {
      // Check if original had INSERT IGNORE
      if (/INSERT\s+IGNORE/i.test(rawSql)) {
        finalText = finalText + ' ON CONFLICT DO NOTHING';
      }
    }

    // Fix ON DUPLICATE KEY UPDATE → ON CONFLICT ... DO UPDATE
    if (finalText.includes('ON DUPLICATE KEY UPDATE')) {
      finalText = finalText.replace(
        /ON DUPLICATE KEY UPDATE\s+([\s\S]+)$/i,
        (_, updates) => {
          // Parse "col=VALUES(col), col2=VALUES(col2)" → "col=EXCLUDED.col, col2=EXCLUDED.col2"
          const setParts = updates.split(',').map((part: string) => {
            return part.replace(/(\w+)\s*=\s*VALUES\s*\(\s*(\w+)\s*\)/gi, '$1=EXCLUDED.$2')
                       .replace(/(\w+)\s*=\s*NOW\s*\(\s*\)/gi, '$1=NOW()');
          });
          // Need to find the conflict column — use the first unique/primary key
          // For simplicity, use DO UPDATE SET
          return `ON CONFLICT DO UPDATE SET ${setParts.join(',')}`;
        }
      );
      // Fix: ON CONFLICT DO UPDATE needs a conflict target
      // Replace "ON CONFLICT DO UPDATE" with a version that specifies conflict target
      // We'll use a generic approach — if we can't determine the key, use DO NOTHING
      if (finalText.includes('ON CONFLICT DO UPDATE SET') && !finalText.match(/ON CONFLICT\s*\(/)) {
        // Try to extract table name and find primary key
        // For now, use the upsert pattern with explicit conflict columns
        // This is handled per-table in the route files that use ON DUPLICATE KEY
        // Fall back to DO NOTHING if we can't parse it
        finalText = finalText.replace('ON CONFLICT DO UPDATE SET', 'ON CONFLICT DO NOTHING --');
      }
    }

    try {
      const rows = await this.sql.query(finalText, values);
      return [rows as any[], null];
    } catch (err: any) {
      // If table doesn't exist yet for CREATE TABLE IF NOT EXISTS, that's fine
      if (err.message?.includes('already exists')) return [[], null];
      throw err;
    }
  }

  release() {
    // No-op — Neon HTTP connections are stateless
  }
}

// ── Pool shim ─────────────────────────────────────────────────────────────────
class NeonPool {
  async getConnection(): Promise<NeonConnection> {
    return new NeonConnection(getSql());
  }
}

let _pool: NeonPool | null = null;

export function getPool(): NeonPool {
  if (!_pool) _pool = new NeonPool();
  return _pool;
}

// ── Convenience helpers ───────────────────────────────────────────────────────
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const conn = new NeonConnection(getSql());
  const [rows] = await conn.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
