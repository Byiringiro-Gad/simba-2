import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';
const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  let manager: any;
  try { manager = jwt.verify(auth.slice(7), JWT_SECRET); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }
  if (manager.role !== 'manager') return NextResponse.json({ ok: false, error: 'Manager only' }, { status: 403 });

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      const [staffList] = await conn.execute(
        `SELECT id, name, username, role FROM branch_staff WHERE branch_id = ? AND role = 'staff'`,
        [manager.branchId]
      ) as any[];
      return NextResponse.json({ ok: true, staff: staffList ?? [] });
    } finally { conn.release(); }
  } catch (dbErr: any) {
    console.warn('[branch/staff-list] DB unavailable, trying Express:', dbErr.message);
    if (EXPRESS_API) {
      try {
        const res = await fetch(`${EXPRESS_API}/branch/staff-list`, {
          headers: { Authorization: auth },
        });
        return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }
    return NextResponse.json({ ok: true, staff: [] });
  }
}
