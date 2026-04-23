import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureOrderColumns(conn: any) {
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
      status           ENUM('processing','delivered','cancelled') NOT NULL DEFAULT 'processing',
      created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

  const requiredColumns = [
    { name: 'user_id', sql: "ALTER TABLE orders ADD COLUMN user_id VARCHAR(255) DEFAULT NULL AFTER id" },
    { name: 'pickup_branch', sql: "ALTER TABLE orders ADD COLUMN pickup_branch VARCHAR(255) NOT NULL DEFAULT '' AFTER customer_phone" },
    { name: 'pickup_slot', sql: "ALTER TABLE orders ADD COLUMN pickup_slot VARCHAR(20) NOT NULL DEFAULT 'asap' AFTER pickup_branch" },
    { name: 'deposit_amount', sql: "ALTER TABLE orders ADD COLUMN deposit_amount INT NOT NULL DEFAULT 0 AFTER discount" },
    { name: 'fulfillment_type', sql: "ALTER TABLE orders ADD COLUMN fulfillment_type VARCHAR(20) NOT NULL DEFAULT 'pickup' AFTER promo_code" },
  ];

  for (const column of requiredColumns) {
    const [rows] = await conn.execute(`SHOW COLUMNS FROM orders LIKE ?`, [column.name]) as any[];
    if ((rows as any[]).length === 0) {
      await conn.execute(column.sql);
    }
  }
}

export async function GET() {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await ensureOrderColumns(conn);

    const [orders] = await conn.execute(`
      SELECT o.id, o.user_id, o.customer_name, o.customer_phone, o.pickup_branch,
             o.pickup_slot, o.payment_method, o.subtotal, o.delivery_fee,
             o.discount, o.deposit_amount, o.total, o.promo_code,
             o.fulfillment_type, o.status, o.created_at AS date, o.updated_at
      FROM orders o
      ORDER BY o.created_at DESC
    `) as any[];

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

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[GET /api/admin/orders]', err.message);
    return NextResponse.json([]);
  } finally {
    conn.release();
  }
}
