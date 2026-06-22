/**
 * Shared admin authentication helper.
 * Accepts either:
 *   1. httpOnly `admin_session` cookie (set by /api/admin/login)
 *   2. `x-admin-token` request header (sent by admin dashboard JS)
 */
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function verifyAdmin(req?: NextRequest): Promise<boolean> {
  // 1. Check httpOnly cookie
  const jar = await cookies();
  if (jar.get('admin_session')?.value === 'authenticated') return true;

  // 2. Check x-admin-token header (only when req is provided)
  if (req) {
    const headerToken = req.headers.get('x-admin-token') ?? '';
    if (headerToken && headerToken === (process.env.ADMIN_PASSWORD ?? 'admin123')) {
      return true;
    }
  }

  return false;
}
