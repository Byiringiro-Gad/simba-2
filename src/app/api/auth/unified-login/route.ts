import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier: string = (body.identifier ?? body.email ?? body.username ?? '').trim();
    const password: string = body.password ?? '';

    if (!identifier || !password) {
      return NextResponse.json({ ok: false, error: 'Credentials required' }, { status: 400 });
    }

    // ── 1. Try Admin credentials first ────────────────────────────────────
    const adminUser = process.env.ADMIN_USERNAME ?? 'admin';
    const adminPass = process.env.ADMIN_PASSWORD ?? 'admin123';
    if (identifier === adminUser && password === adminPass) {
      const res = NextResponse.json({ ok: true, role: 'admin', redirect: '/admin' });
      res.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      });
      return res;
    }

    // ── 2. Try Branch Staff credentials ───────────────────────────────────
    try {
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        const uname = identifier.toLowerCase();
        const [staffRows] = await conn.execute(
          'SELECT * FROM branch_staff WHERE username = ?',
          [uname]
        ) as any[];

        if (staffRows && (staffRows as any[]).length > 0) {
          const s = (staffRows as any[])[0];
          const valid = await bcrypt.compare(password, s.password_hash);
          if (valid) {
            const token = jwt.sign(
              { id: s.id, name: s.name, username: s.username, branchId: s.branch_id, branchName: s.branch_name, role: s.role },
              JWT_SECRET,
              { expiresIn: '12h' }
            );
            const redirect = s.role === 'manager' ? '/branch' : '/branch/staff';
            return NextResponse.json({
              ok: true,
              role: s.role === 'manager' ? 'manager' : 'staff',
              redirect,
              token,
              staff: {
                id: s.id,
                name: s.name,
                username: s.username,
                branchId: s.branch_id,
                branchName: s.branch_name,
                role: s.role,
              },
            });
          }
        }
      } finally {
        conn.release();
      }
    } catch {
      // Database lookup failed; execution continues to the static credential fallback below.
    }

    // ── 2b. Demo branch staff fallback ────────────────────────────────────
    const BRANCHES = ['remera','kimironko','kacyiru','nyamirambo','gikondo','kanombe','kinyinya','kibagabaga','nyanza'];
    const uname = identifier.toLowerCase();
    for (const b of BRANCHES) {
      if (uname === `manager_${b}` && password === 'manager123') {
        const branchName = `Simba Supermarket ${b.charAt(0).toUpperCase() + b.slice(1)}`;
        const token = jwt.sign(
          { id: `demo_${uname}`, name: `Manager ${branchName}`, username: uname, branchId: b, branchName, role: 'manager' },
          JWT_SECRET, { expiresIn: '12h' }
        );
        return NextResponse.json({ ok: true, role: 'manager', redirect: '/branch', token, staff: { id: `demo_${uname}`, name: `Manager ${branchName}`, username: uname, branchId: b, branchName, role: 'manager' } });
      }
      if (uname === `staff_${b}` && password === 'staff123') {
        const branchName = `Simba Supermarket ${b.charAt(0).toUpperCase() + b.slice(1)}`;
        const token = jwt.sign(
          { id: `demo_${uname}`, name: `Staff ${branchName}`, username: uname, branchId: b, branchName, role: 'staff' },
          JWT_SECRET, { expiresIn: '12h' }
        );
        return NextResponse.json({ ok: true, role: 'staff', redirect: '/branch/staff', token, staff: { id: `demo_${uname}`, name: `Staff ${branchName}`, username: uname, branchId: b, branchName, role: 'staff' } });
      }
    }

    // ── 3. Try Customer credentials (email + password) ─────────────────────
    // Identifier must be an email for customer auth
    if (!identifier.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const email = identifier.toLowerCase();

    // Demo customer
    if (email === 'demo@simba.rw' && password === 'demo1234') {
      const token = jwt.sign(
        { id: 'demo-user-001', email, name: 'Demo Customer' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      return NextResponse.json({
        ok: true,
        role: 'customer',
        redirect: '/',
        token,
        user: { id: 'demo-user-001', name: 'Demo Customer', email, phone: '+250788000000', referralCode: 'SIMBADEMO', loyaltyPoints: 150 },
      });
    }

    // Real customer from DB
    try {
      const pool = getPool();
      const conn = await pool.getConnection();
      try {
        const [users] = await conn.execute(
          'SELECT * FROM users WHERE email = ?',
          [email]
        ) as any[];

        if (!users || (users as any[]).length === 0) {
          return NextResponse.json({ ok: false, error: 'No account found with these credentials' }, { status: 401 });
        }

        const u = (users as any[])[0];
        const valid = await bcrypt.compare(password, u.password_hash);
        if (!valid) {
          return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
        }

        const token = jwt.sign(
          { id: u.id, email: u.email, name: u.name },
          JWT_SECRET,
          { expiresIn: '30d' }
        );
        return NextResponse.json({
          ok: true,
          role: 'customer',
          redirect: '/',
          token,
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            referralCode: u.referral_code,
            loyaltyPoints: u.loyalty_points,
          },
        });
      } finally {
        conn.release();
      }
    } catch (err: any) {
      const isDbError = err.message?.includes('ECONNREFUSED') || err.message?.includes('connect');
      return NextResponse.json(
        { ok: false, error: isDbError ? 'Service temporarily unavailable' : 'Login failed' },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
