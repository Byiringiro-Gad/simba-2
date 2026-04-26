import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';
const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL ?? '';

async function ensureBranchTables(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS branch_staff (
      id            VARCHAR(36)  PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      username      VARCHAR(50)  NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      branch_id     VARCHAR(50)  NOT NULL,
      branch_name   VARCHAR(255) NOT NULL,
      role          ENUM('manager','staff') NOT NULL DEFAULT 'staff',
      created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // Seed default staff if table is empty
  const [rows] = await conn.execute('SELECT COUNT(*) AS cnt FROM branch_staff') as any[];
  if (Number(rows[0]?.cnt) === 0) {
    const bcryptLib = await import('bcryptjs');
    const { v4: uuidv4 } = await import('uuid');
    const managerHash = await bcryptLib.hash('manager123', 10);
    const staffHash   = await bcryptLib.hash('staff123', 10);

    const branches = [
      { id: 'remera',     name: 'Simba Supermarket Remera' },
      { id: 'kimironko',  name: 'Simba Supermarket Kimironko' },
      { id: 'kacyiru',    name: 'Simba Supermarket Kacyiru' },
      { id: 'nyamirambo', name: 'Simba Supermarket Nyamirambo' },
      { id: 'gikondo',    name: 'Simba Supermarket Gikondo' },
      { id: 'kanombe',    name: 'Simba Supermarket Kanombe' },
      { id: 'kinyinya',   name: 'Simba Supermarket Kinyinya' },
      { id: 'kibagabaga', name: 'Simba Supermarket Kibagabaga' },
      { id: 'nyanza',     name: 'Simba Supermarket Nyanza' },
    ];

    for (const b of branches) {
      await conn.execute(
        `INSERT IGNORE INTO branch_staff (id, name, username, password_hash, branch_id, branch_name, role) VALUES (?,?,?,?,?,?,?)`,
        [uuidv4(), `Manager ${b.name}`, `manager_${b.id}`, managerHash, b.id, b.name, 'manager']
      );
      await conn.execute(
        `INSERT IGNORE INTO branch_staff (id, name, username, password_hash, branch_id, branch_name, role) VALUES (?,?,?,?,?,?,?)`,
        [uuidv4(), `Staff ${b.name}`, `staff_${b.id}`, staffHash, b.id, b.name, 'staff']
      );
    }
    console.log('[branch/login] Branch staff seeded');
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ ok: false, error: 'Username and password required' }, { status: 400 });
  }

  // ── Try Next.js DB route first ──────────────────────────────────────────
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureBranchTables(conn);

      const [staff] = await conn.execute(
        'SELECT * FROM branch_staff WHERE username = ?',
        [username.toLowerCase().trim()]
      ) as any[];

      if (!staff || (staff as any[]).length === 0) {
        return NextResponse.json({ ok: false, error: 'No account found' }, { status: 401 });
      }

      const s = (staff as any[])[0];
      const valid = await bcrypt.compare(password, s.password_hash);
      if (!valid) {
        return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
      }

      const token = jwt.sign(
        { id: s.id, name: s.name, username: s.username, branchId: s.branch_id, branchName: s.branch_name, role: s.role },
        JWT_SECRET,
        { expiresIn: '12h' }
      );

      return NextResponse.json({
        ok: true,
        token,
        staff: { id: s.id, name: s.name, username: s.username, branchId: s.branch_id, branchName: s.branch_name, role: s.role },
      });
    } finally {
      conn.release();
    }
  } catch (dbErr: any) {
    console.warn('[branch/login] DB unavailable, trying Express fallback:', dbErr.message);

    // ── Fallback: proxy to Express backend if configured ────────────────
    if (EXPRESS_API) {
      try {
        const res = await fetch(`${EXPRESS_API}/branch/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (expressErr: any) {
        console.error('[branch/login] Express fallback also failed:', expressErr.message);
      }
    }

    return NextResponse.json({ ok: false, error: 'Service temporarily unavailable. Please try again.' }, { status: 503 });
  }
}
