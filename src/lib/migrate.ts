import { getPool } from './db';

export async function migrate() {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    // Orders table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id          VARCHAR(20)  PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL DEFAULT '',
        customer_phone VARCHAR(20) NOT NULL DEFAULT '',
        delivery_address TEXT NOT NULL DEFAULT '',
        delivery_slot VARCHAR(20) NOT NULL DEFAULT 'asap',
        payment_method VARCHAR(10) NOT NULL DEFAULT 'mtn',
        subtotal    INT NOT NULL DEFAULT 0,
        delivery_fee INT NOT NULL DEFAULT 1000,
        discount    INT NOT NULL DEFAULT 0,
        total       INT NOT NULL,
        promo_code  VARCHAR(20) DEFAULT NULL,
        status      ENUM('processing','delivered','cancelled') NOT NULL DEFAULT 'processing',
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Order items table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        order_id    VARCHAR(20) NOT NULL,
        product_id  INT NOT NULL,
        name        VARCHAR(255) NOT NULL,
        price       INT NOT NULL,
        quantity    INT NOT NULL,
        unit        VARCHAR(50) NOT NULL DEFAULT 'Pcs',
        image       TEXT NOT NULL DEFAULT '',
        category    VARCHAR(100) NOT NULL DEFAULT '',
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('[DB] Migration complete');
  } finally {
    conn.release();
  }
}
