import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureOrderSchema(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id               VARCHAR(20)   PRIMARY KEY,
      user_id          VARCHAR(255)  DEFAULT NULL,
      customer_name    VARCHAR(100)  NOT NULL DEFAULT '',
      customer_phone   VARCHAR(20)   NOT NULL DEFAULT '',
      pickup_branch    VARCHAR(255)  NOT NULL DEFAULT '',
      pickup_slot      VARCHAR(20)   NOT NULL DEFAULT 'asap',
      payment_method   VARCHAR(10)   NOT NULL DEFAULT 'mtn',
      subtotal         INT           NOT NULL DEFAULT 0,
      delivery_fee     INT           NOT NULL DEFAULT 0,
      discount         INT           NOT NULL DEFAULT 0,
      deposit_amount   INT           NOT NULL DEFAULT 0,
      total            INT           NOT NULL,
      promo_code       VARCHAR(20)   DEFAULT NULL,
      fulfillment_type VARCHAR(20)   NOT NULL DEFAULT 'pickup',
      status           VARCHAR(20)   NOT NULL DEFAULT 'processing',
      assigned_to      VARCHAR(36)   DEFAULT NULL,
      assigned_name    VARCHAR(100)  DEFAULT NULL,
      branch_status    VARCHAR(20)   NOT NULL DEFAULT 'pending',
      created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    )
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id          SERIAL PRIMARY KEY,
      order_id    VARCHAR(20)   NOT NULL,
      product_id  INT           NOT NULL,
      name        VARCHAR(255)  NOT NULL,
      price       INT           NOT NULL,
      quantity    INT           NOT NULL,
      unit        VARCHAR(50)   NOT NULL DEFAULT 'Pcs',
      image       VARCHAR(500)  NOT NULL DEFAULT '',
      category    VARCHAR(100)  NOT NULL DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);
}

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  const {
    id, userId, customerName, customerPhone, pickupBranch, pickupSlot,
    paymentMethod, depositAmount, items, subtotal, deliveryFee, discount, total, promoCode,
  } = body;

  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureOrderSchema(conn);
      await conn.execute(
        `INSERT INTO orders
          (id, user_id, customer_name, customer_phone, pickup_branch, pickup_slot,
           payment_method, subtotal, delivery_fee, discount, deposit_amount, total,
           promo_code, fulfillment_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pickup', 'processing')`,
        [id, userId ?? null, customerName ?? '', customerPhone ?? '', pickupBranch ?? '',
         pickupSlot ?? 'asap', paymentMethod ?? 'mtn', subtotal ?? 0, deliveryFee ?? 0,
         discount ?? 0, depositAmount ?? 0, total, promoCode ?? null]
      );
      for (const item of items ?? []) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, name, price, quantity, unit, image, category)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, item.id, item.name, item.price, item.quantity, item.unit ?? 'Pcs',
           (item.image ?? '').slice(0, 499), item.category ?? '']
        );
      }
    } finally { conn.release(); }
  } catch (dbErr: any) {
    console.warn('[POST /api/orders] DB error:', dbErr.message);
  }

  return NextResponse.json({ ok: true, id });
}

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureOrderSchema(conn);
      const userId = req.nextUrl.searchParams.get('userId');
      const [orders] = await conn.execute(
        `SELECT o.id, o.user_id, o.customer_name, o.customer_phone, o.pickup_branch,
                o.pickup_slot, o.payment_method, o.subtotal, o.delivery_fee,
                o.discount, o.deposit_amount, o.total, o.promo_code,
                o.fulfillment_type, o.status, o.branch_status, o.assigned_to, o.assigned_name,
                o.created_at AS date, o.updated_at
         FROM orders o
         ${userId ? 'WHERE o.user_id = ?' : ''}
         ORDER BY o.created_at DESC`,
        userId ? [userId] : []
      ) as any[];

      const result = await Promise.all(
        (orders as any[]).map(async (order: any) => {
          const [items] = await conn.execute(
            `SELECT product_id AS id, name, price, quantity, unit, image, category
             FROM order_items WHERE order_id = ?`,
            [order.id]
          ) as any[];
          return { ...order, items: items ?? [] };
        })
      );
      return NextResponse.json({ ok: true, orders: result });
    } finally { conn.release(); }
  } catch (err: any) {
    console.warn('[GET /api/orders] DB error:', err.message);
    return NextResponse.json({ ok: true, orders: [] });
  }
}
