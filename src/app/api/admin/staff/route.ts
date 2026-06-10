import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

function verifyAdmin() {
  const session = cookies().get('admin_session');
  return session?.value === 'authenticated';
}

export async function GET() {
  if (!verifyAdmin()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.execute('SELECT id, name, username, branch_id, branch_name, role, created_at FROM branch_staff ORDER BY created_at DESC') as any[];
      return NextResponse.json({ ok: true, staff: rows ?? [] });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, username, password, branchId, branchName, role } = await req.json();
    if (!username || !password || !branchId) return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute(
        `INSERT INTO branch_staff (id, name, username, password_hash, branch_id, branch_name, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name || username, username, passwordHash, branchId, branchName || branchId, role || 'staff']
      );
      return NextResponse.json({ ok: true, id });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
