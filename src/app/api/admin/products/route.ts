import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function ensureProductsTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS product_overrides (
      id           INT          PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      price        INT          NOT NULL,
      category     VARCHAR(100) NOT NULL,
      unit         VARCHAR(50)  NOT NULL DEFAULT 'Pcs',
      image        VARCHAR(500) NOT NULL DEFAULT '',
      in_stock     TINYINT(1)   NOT NULL DEFAULT 1,
      stock_count  INT          NOT NULL DEFAULT 100,
      description  TEXT         DEFAULT NULL,
      updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS product_additions (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      price        INT          NOT NULL,
      category     VARCHAR(100) NOT NULL,
      unit         VARCHAR(50)  NOT NULL DEFAULT 'Pcs',
      image        VARCHAR(500) NOT NULL DEFAULT '',
      in_stock     TINYINT(1)   NOT NULL DEFAULT 1,
      stock_count  INT          NOT NULL DEFAULT 100,
      description  TEXT         DEFAULT NULL,
      created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

// GET /api/admin/products — all products (JSON + DB overrides + additions)
export async function GET() {
  try {
    const base = getSimbaData().products;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureProductsTable(conn);

      const [overrides] = await conn.execute('SELECT * FROM product_overrides') as any[];
      const [additions] = await conn.execute('SELECT * FROM product_additions ORDER BY created_at DESC') as any[];

      const overrideMap: Record<number, any> = {};
      for (const o of (overrides as any[])) overrideMap[o.id] = o;

      const merged = base.map(p => {
        const ov = overrideMap[p.id];
        if (!ov) return { ...p, source: 'json' };
        return {
          id: p.id,
          name: ov.name,
          price: ov.price,
          category: ov.category,
          unit: ov.unit,
          image: ov.image,
          inStock: !!ov.in_stock,
          stockCount: ov.stock_count,
          description: ov.description ?? null,
          source: 'override',
        };
      });

      const added = (additions as any[]).map(a => ({
        id: a.id + 900000, // offset to avoid collision with JSON ids
        _dbId: a.id,
        name: a.name,
        price: a.price,
        category: a.category,
        unit: a.unit,
        image: a.image,
        inStock: !!a.in_stock,
        stockCount: a.stock_count,
        description: a.description ?? null,
        source: 'addition',
      }));

      return NextResponse.json({ ok: true, products: [...merged, ...added] });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    // Fallback to JSON only
    const base = getSimbaData().products;
    return NextResponse.json({ ok: true, products: base.map(p => ({ ...p, source: 'json' })) });
  }
}

// POST /api/admin/products — add new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, price, category, unit, image, inStock, stockCount, description } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ ok: false, error: 'name, price, category required' }, { status: 400 });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureProductsTable(conn);
      const [result] = await conn.execute(
        `INSERT INTO product_additions (name, price, category, unit, image, in_stock, stock_count, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, Math.round(price), category, unit ?? 'Pcs', image ?? '', inStock ? 1 : 0, stockCount ?? 100, description ?? null]
      ) as any[];
      return NextResponse.json({ ok: true, id: result.insertId });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
