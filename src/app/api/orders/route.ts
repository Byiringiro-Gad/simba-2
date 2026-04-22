import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

// POST /api/orders — place a new order
export async function POST(req: NextRequest) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const body = await req.json();
    const {
      id, customerName, customerPhone, deliveryAddress,
      deliverySlot, paymentMethod, items,
      subtotal, deliveryFee, discount, total, promoCode,
    } = body;

    // Ensure tables exist
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id              VARCHAR(20)   PRIMARY KEY,
        customer_name   VARCHAR(100)  NOT NULL DEFAULT '',
        customer_phone  VARCHAR(20)   NOT NULL DEFAULT '',
        delivery_address VARCHAR(500) NOT NULL DEFAULT '',
        delivery_slot   VARCHAR(20)   NOT NULL DEFAULT 'asap',
        payment_method  VARCHAR(10)   NOT NULL DEFAULT 'mtn',
        subtotal        INT           NOT NULL DEFAULT 0,
        delivery_fee    INT           NOT NULL DEFAULT 1000,
        discount        INT           NOT NULL DEFAULT 0,
        total           INT           NOT NULL,
        promo_code      VARCHAR(20)   DEFAULT NULL,
        status          ENUM('processing','delivered','cancelled') NOT NULL DEFAULT 'processing',
        created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        order_id    VARCHAR(20)   NOT NULL,
        product_id  INT           NOT NULL,
        name        VARCHAR(255)  NOT NULL,
        price       INT           NOT NULL,
        quantity    INT           NOT NULL,
        unit        VARCHAR(50)   NOT NULL DEFAULT 'Pcs',
        image       VARCHAR(500)  NOT NULL DEFAULT '',
        category    VARCHAR(100)  NOT NULL DEFAULT '',
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Insert order
    await conn.execute(
      `INSERT INTO orders
        (id, customer_name, customer_phone, delivery_address, delivery_slot,
         payment_method, subtotal, delivery_fee, discount, total, promo_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [
        id,
        customerName ?? '',
        customerPhone ?? '',
        deliveryAddress ?? '',
        deliverySlot ?? 'asap',
        paymentMethod ?? 'mtn',
        subtotal ?? 0,
        deliveryFee ?? 1000,
        discount ?? 0,
        total,
        promoCode ?? null,
      ]
    );

    // Insert items
    for (const item of items ?? []) {
      await conn.execute(
        `INSERT INTO order_items
          (order_id, product_id, name, price, quantity, unit, image, category)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.unit ?? 'Pcs',
          (item.image ?? '').slice(0, 499),
          item.category ?? '',
        ]
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('[POST /api/orders]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  } finally {
    conn.release();
  }
}

// GET /api/orders — list all orders
export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    const [orders] = await conn.execute(`
      SELECT o.id, o.customer_name, o.customer_phone, o.delivery_address,
             o.delivery_slot, o.payment_method, o.subtotal, o.delivery_fee,
             o.discount, o.total, o.promo_code, o.status,
             o.created_at AS date, o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `) as any[];

    const result = await Promise.all(
      (orders as any[]).map(async (o: any) => {
        const [items] = await conn.execute(
          `SELECT product_id AS id, name, price, quantity, unit, image, category
           FROM order_items WHERE order_id = ?`,
          [o.id]
        ) as any[];
        return { ...o, items: items ?? [] };
      })
    );

    return NextResponse.json({ ok: true, orders: result });
  } catch (err: any) {
    console.error('[GET /api/orders]', err.message);
    return NextResponse.json({ ok: false, orders: [], error: err.message });
  } finally {
    conn.release();
  }
}
