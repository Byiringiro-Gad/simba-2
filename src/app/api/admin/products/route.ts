import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function ensureProductsTables(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS product_overrides (
      id           INT          PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      price        INT          NOT NULL,
      category     VARCHAR(100) NOT NULL,
      unit         VARCHAR(50)  NOT NULL DEFAULT 'Pcs',
      image        VARCHAR(500) NOT NULL DEFAULT '',
      in_stock     BOOLEAN      NOT NULL DEFAULT true,
      stock_count  INT          NOT NULL DEFAULT 100,
      description  TEXT         DEFAULT NULL,
      updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS product_additions (
      id           SERIAL       PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      price        INT          NOT NULL,
      category     VARCHAR(100) NOT NULL,
      unit         VARCHAR(50)  NOT NULL DEFAULT 'Pcs',
      image        VARCHAR(500) NOT NULL DEFAULT '',
      in_stock     BOOLEAN      NOT NULL DEFAULT true,
      stock_count  INT          NOT NULL DEFAULT 100,
      description  TEXT         DEFAULT NULL,
      created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    const base = getSimbaData().products;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureProductsTables(conn);
      const [overrides] = await conn.execute('SELECT * FROM product_overrides') as any[];
      const [additions] = await conn.execute('SELECT * FROM product_additions ORDER BY created_at DESC') as any[];

      const overrideMap: Record<number, any> = {};
      for (const o of (overrides as any[])) overrideMap[o.id] = o;

      const merged = base.map(p => {
        const ov = overrideMap[p.id];
        if (!ov) return { ...p, source: 'json' };
        return { id: p.id, name: ov.name, price: ov.price, category: ov.category, unit: ov.unit,
          image: ov.image, inStock: !!ov.in_stock, stockCount: ov.stock_count,
          description: ov.description ?? null, source: 'override' };
      });

      const added = (additions as any[]).map(a => ({
        id: a.id + 900000, _dbId: a.id, name: a.name, price: a.price, category: a.category,
        unit: a.unit, image: a.image, inStock: !!a.in_stock, stockCount: a.stock_count,
        description: a.description ?? null, source: 'addition',
      }));

      return NextResponse.json({ ok: true, products: [...merged, ...added] });
    } finally { conn.release(); }
  } catch (err: any) {
    const base = getSimbaData().products;
    return NextResponse.json({ ok: true, products: base.map(p => ({ ...p, source: 'json' })) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, price, category, unit, image, inStock, stockCount, description } = await req.json();
    if (!name || !price || !category) {
      return NextResponse.json({ ok: false, error: 'name, price, category required' }, { status: 400 });
    }
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureProductsTables(conn);
      const [result] = await conn.execute(
        `INSERT INTO product_additions (name, price, category, unit, image, in_stock, stock_count, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, Math.round(price), category, unit ?? 'Pcs', image ?? '', inStock ? true : false, stockCount ?? 100, description ?? null]
      ) as any[];
      return NextResponse.json({ ok: true, id: result?.insertId ?? result?.id });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
