import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET ?? 'simba_secret_2026';
const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL ?? '';

function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as any; } catch { return null; }
}

async function ensureOrderColumns(conn: any) {
  const cols = [
    `ALTER TABLE orders ADD COLUMN assigned_to VARCHAR(36) DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN assigned_name VARCHAR(100) DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN branch_status ENUM('pending','preparing','ready','picked_up') NOT NULL DEFAULT 'pending'`,
    `ALTER TABLE orders ADD COLUMN pickup_branch VARCHAR(255) NOT NULL DEFAULT ''`,
    `ALTER TABLE orders ADD COLUMN pickup_slot VARCHAR(20) NOT NULL DEFAULT 'asap'`,
    `ALTER TABLE orders ADD COLUMN deposit_amount INT NOT NULL DEFAULT 0`,
  ];
  for (const sql of cols) { try { await conn.execute(sql); } catch { /* already exists */ } }
}

export async function GET(req: NextRequest) {
  const staff = verifyToken(req);
  if (!staff) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  // Try DB directly
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureOrderColumns(conn);
      let orders: any[];
      if (staff.role === 'manager') {
        const [rows] = await conn.execute(
          `SELECT o.* FROM orders o WHERE o.pickup_branch = ? ORDER BY o.created_at DESC`,
          [staff.branchName]
        ) as any[];
        orders = rows as any[];
      } else {
        const [rows] = await conn.execute(
          `SELECT o.* FROM orders o WHERE o.pickup_branch = ? AND o.assigned_to = ? ORDER BY o.created_at DESC`,
          [staff.branchName, staff.id]
        ) as any[];
        orders = rows as any[];
      }
      const result = await Promise.all(orders.map(async (o: any) => {
        const [items] = await conn.execute(
          `SELECT product_id AS id, name, price, quantity, unit, image, category FROM order_items WHERE order_id = ?`,
          [o.id]
        ) as any[];
        return { ...o, items: items ?? [], date: o.created_at };
      }));
      return NextResponse.json({ ok: true, orders: result });
    } finally { conn.release(); }
  } catch (dbErr: any) {
    console.warn('[branch/orders] DB unavailable, trying Express:', dbErr.message);
    if (EXPRESS_API) {
      try {
        const res = await fetch(`${EXPRESS_API}/branch/orders`, {
          headers: { Authorization: req.headers.get('authorization') ?? '' },
        });
        return NextResponse.json(await res.json());
      } catch { /* fall through */ }
    }
    return NextResponse.json({ ok: true, orders: [] });
  }
}
