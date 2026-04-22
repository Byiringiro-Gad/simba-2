import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { migrate } from '@/lib/migrate';

let migrated = false;
async function ensureMigrated() {
  if (!migrated) { await migrate(); migrated = true; }
}

export async function GET() {
  try {
    await ensureMigrated();

    const orders = await query(`
      SELECT
        o.id,
        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        o.delivery_slot,
        o.payment_method,
        o.subtotal,
        o.delivery_fee,
        o.discount,
        o.total,
        o.promo_code,
        o.status,
        o.created_at AS date,
        o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `);

    // Fetch items for each order
    const result = await Promise.all(
      orders.map(async (o: any) => {
        const items = await query(
          `SELECT product_id AS id, name, price, quantity, unit, image, category
           FROM order_items WHERE order_id = ?`,
          [o.id]
        );
        return { ...o, items };
      })
    );

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[GET /api/admin/orders]', err.message);
    // Return empty array so admin page doesn't crash
    return NextResponse.json([]);
  }
}
