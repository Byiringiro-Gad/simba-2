import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { migrate } from '@/lib/migrate';

let migrated = false;

async function ensureMigrated() {
  if (!migrated) {
    await migrate();
    migrated = true;
  }
}

// POST /api/orders — place a new order
export async function POST(req: NextRequest) {
  try {
    await ensureMigrated();
    const body = await req.json();

    const {
      id, customerName, customerPhone, deliveryAddress,
      deliverySlot, paymentMethod, items,
      subtotal, deliveryFee, discount, total, promoCode,
    } = body;

    // Insert order
    await query(
      `INSERT INTO orders
        (id, customer_name, customer_phone, delivery_address, delivery_slot,
         payment_method, subtotal, delivery_fee, discount, total, promo_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [id, customerName ?? '', customerPhone ?? '', deliveryAddress ?? '',
       deliverySlot ?? 'asap', paymentMethod ?? 'mtn',
       subtotal ?? 0, deliveryFee ?? 1000, discount ?? 0, total, promoCode ?? null]
    );

    // Insert items
    for (const item of items) {
      await query(
        `INSERT INTO order_items
          (order_id, product_id, name, price, quantity, unit, image, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, item.id, item.name, item.price, item.quantity,
         item.unit ?? 'Pcs', item.image ?? '', item.category ?? '']
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('[POST /api/orders]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// GET /api/orders — list all orders (admin)
export async function GET() {
  try {
    await ensureMigrated();

    const orders = await query(`
      SELECT o.*,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity,
            'unit', oi.unit,
            'image', oi.image,
            'category', oi.category
          )
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    // Parse items JSON string
    const result = orders.map((o: any) => ({
      ...o,
      items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items ?? []),
      date: o.created_at,
    }));

    return NextResponse.json({ ok: true, orders: result });
  } catch (err: any) {
    console.error('[GET /api/orders]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
