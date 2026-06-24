import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { verifyAdmin } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { name, username, password, branchId, branchName, role } = await req.json();

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      // Build dynamic update
      const sets: string[] = [];
      const vals: any[] = [];

      if (name !== undefined)       { sets.push('name = ?');        vals.push(name); }
      if (username !== undefined)   { sets.push('username = ?');    vals.push(username.toLowerCase().trim()); }
      if (branchId !== undefined)   { sets.push('branch_id = ?');   vals.push(branchId); }
      if (branchName !== undefined) { sets.push('branch_name = ?'); vals.push(branchName); }
      if (role !== undefined)       { sets.push('role = ?');        vals.push(role); }
      if (password)                 { sets.push('password_hash = ?'); vals.push(await bcrypt.hash(password, 10)); }

      if (sets.length === 0) {
        return NextResponse.json({ ok: false, error: 'Nothing to update' }, { status: 400 });
      }

      vals.push(id);
      await conn.execute(`UPDATE branch_staff SET ${sets.join(', ')} WHERE id = ?`, vals);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.execute('DELETE FROM branch_staff WHERE id = ?', [id]);
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
