
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';
const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL ?? '';

const BRANCHES = [
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

// Instant demo map — no DB needed for standard credentials
const DEMO_STAFF: Record<string, {
  password: string; name: string;
  branchId: string; branchName: string; role: 'manager' | 'staff';
}> = {};
for (const b of BRANCHES) {
  DEMO_STAFF[`manager_${b.id}`] = { password: 'manager123', name: `Manager ${b.name}`, branchId: b.id, branchName: b.name, role: 'manager' };
  DEMO_STAFF[`staff_${b.id}`]   = { password: 'staff123',   name: `Staff ${b.name}`,   branchId: b.id, branchName: b.name, role: 'staff' };
}

async function ensureBranchTables(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS branch_staff (
      id            VARCHAR(36)  PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      username      VARCHAR(50)  NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      branch_id     VARCHAR(50)  NOT NULL,
      branch_name   VARCHAR(255) NOT NULL,
      role          VARCHAR(10)  NOT NULL DEFAULT 'staff',
      created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);

  const [rows] = await conn.execute('SELECT COUNT(*) AS cnt FROM branch_staff') as any[];
  if (Number(rows[0]?.cnt) === 0) {
    const { hash } = await import('bcryptjs');
    const { v4: uuidv4 } = await import('uuid');
    const managerHash = await hash('manager123', 10);
    const staffHash   = await hash('staff123', 10);
    for (const b of BRANCHES) {
      await conn.execute(
        `INSERT INTO branch_staff (id, name, username, password_hash, branch_id, branch_name, role)
         VALUES (?,?,?,?,?,?,?) ON CONFLICT (username) DO NOTHING`,
        [uuidv4(), `Manager ${b.name}`, `manager_${b.id}`, managerHash, b.id, b.name, 'manager']
      );
      await conn.execute(
        `INSERT INTO branch_staff (id, name, username, password_hash, branch_id, branch_name, role)
         VALUES (?,?,?,?,?,?,?) ON CONFLICT (username) DO NOTHING`,
        [uuidv4(), `Staff ${b.name}`, `staff_${b.id}`, staffHash, b.id, b.name, 'staff']
      );
    }
    console.log('[branch/login] Branch staff seeded into Neon');
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

  const uname = username.toLowerCase().trim();

  // ── 1. Instant: standard demo credentials, zero DB round-trip ────────────
  const demo = DEMO_STAFF[uname];
  if (demo && password === demo.password) {
    const token = jwt.sign(
      { id: `demo_${uname}`, name: demo.name, username: uname, branchId: demo.branchId, branchName: demo.branchName, role: demo.role },
      JWT_SECRET, { expiresIn: '12h' }
    );
    // Seed DB in background — don't block the response
    getPool().getConnection()
      .then(conn => ensureBranchTables(conn).finally(() => conn.release()))
      .catch(() => {});
    return NextResponse.json({
      ok: true, token,
      staff: { id: `demo_${uname}`, name: demo.name, username: uname, branchId: demo.branchId, branchName: demo.branchName, role: demo.role },
    });
  }

  // ── 2. DB path: custom credentials ───────────────────────────────────────
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureBranchTables(conn);
      const [staff] = await conn.execute('SELECT * FROM branch_staff WHERE username = ?', [uname]) as any[];
      if (!staff || (staff as any[]).length === 0) {
        return NextResponse.json({ ok: false, error: 'No account found' }, { status: 401 });
      }
      const s = (staff as any[])[0];
      const valid = await bcrypt.compare(password, s.password_hash);
      if (!valid) return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
      const token = jwt.sign(
        { id: s.id, name: s.name, username: s.username, branchId: s.branch_id, branchName: s.branch_name, role: s.role },
        JWT_SECRET, { expiresIn: '12h' }
      );
      return NextResponse.json({
        ok: true, token,
        staff: { id: s.id, name: s.name, username: s.username, branchId: s.branch_id, branchName: s.branch_name, role: s.role },
      });
    } finally { conn.release(); }
  } catch (dbErr: any) {
    console.warn('[branch/login] DB unavailable:', dbErr.message);
    // ── 3. Express fallback ───────────────────────────────────────────────
    if (EXPRESS_API) {
      try {
        const res = await fetch(`${EXPRESS_API}/branch/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        return NextResponse.json(await res.json(), { status: res.status });
      } catch { /* fall through */ }
    }
    return NextResponse.json({ ok: false, error: 'Service temporarily unavailable.' }, { status: 503 });
  }
}
