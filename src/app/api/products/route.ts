import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Returns the full product catalog: static JSON products merged with
 * DB overrides (price/stock changes) and DB additions (new products).
 *
 * This is the single source of truth for the storefront so admin changes
 * are reflected immediately without a redeploy.
 */
export async function GET() {
  try {
    const base = getSimbaData().products;
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      // Ensure tables exist (no-op if already created)
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

      const [overrides] = await conn.execute('SELECT * FROM product_overrides') as any[];
      const [additions] = await conn.execute(
        'SELECT * FROM product_additions WHERE in_stock = TRUE ORDER BY created_at DESC'
      ) as any[];

      // Build override map for O(1) lookup
      const overrideMap: Record<number, any> = {};
      for (const o of (overrides as any[])) overrideMap[o.id] = o;

      // Merge base JSON with overrides
      const merged = base.map(p => {
        const ov = overrideMap[p.id];
        if (!ov) return p;
        return {
          ...p,
          name:       ov.name,
          price:      ov.price,
          category:   ov.category,
          unit:       ov.unit,
          image:      ov.image || p.image,
          inStock:    Boolean(ov.in_stock),
          stockCount: ov.stock_count,
        };
      });

      // Append DB-added products (offset IDs to avoid collisions with JSON products)
      const added = (additions as any[]).map((a: any) => ({
        id:         a.id + 900000,
        name:       a.name,
        price:      a.price,
        category:   a.category,
        unit:       a.unit,
        image:      a.image,
        inStock:    Boolean(a.in_stock),
        stockCount: a.stock_count,
        subcategoryId: 0,
      }));

      return NextResponse.json({ ok: true, products: [...merged, ...added] });
    } finally { conn.release(); }
  } catch (err: any) {
    // DB unavailable — fall back to static data (zero downtime)
    console.warn('[GET /api/products] DB unavailable, serving static data:', err.message);
    return NextResponse.json({ ok: true, products: getSimbaData().products });
  }
}
