import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/products/[id] — edit a product (creates override for JSON products)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name, price, category, unit, image, inStock, stockCount, description } = body;

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      // Check if it's an addition (id > 900000)
      if (id > 900000) {
        const dbId = id - 900000;
        await conn.execute(
          `UPDATE product_additions SET name=?, price=?, category=?, unit=?, image=?, in_stock=?, stock_count=?, description=?, updated_at=NOW()
           WHERE id=?`,
          [name, Math.round(price), category, unit ?? 'Pcs', image ?? '', inStock ? 1 : 0, stockCount ?? 100, description ?? null, dbId]
        );
        return NextResponse.json({ ok: true });
      }

      // For JSON products — upsert into product_overrides
      const base = getSimbaData().products.find(p => p.id === id);
      await conn.execute(
        `INSERT INTO product_overrides (id, name, price, category, unit, image, in_stock, stock_count, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name=VALUES(name), price=VALUES(price), category=VALUES(category),
           unit=VALUES(unit), image=VALUES(image), in_stock=VALUES(in_stock),
           stock_count=VALUES(stock_count), description=VALUES(description), updated_at=NOW()`,
        [
          id,
          name ?? base?.name ?? '',
          Math.round(price ?? base?.price ?? 0),
          category ?? base?.category ?? '',
          unit ?? base?.unit ?? 'Pcs',
          image ?? base?.image ?? '',
          inStock !== undefined ? (inStock ? 1 : 0) : (base?.inStock ? 1 : 0),
          stockCount ?? base?.stockCount ?? 100,
          description ?? null,
        ]
      );
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — only additions can be deleted; JSON products get marked out of stock
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      if (id > 900000) {
        await conn.execute('DELETE FROM product_additions WHERE id = ?', [id - 900000]);
      } else {
        // Mark JSON product as out of stock via override
        await conn.execute(
          `INSERT INTO product_overrides (id, name, price, category, unit, image, in_stock, stock_count)
           SELECT ?, name, price, category, unit, image, 0, 0 FROM (SELECT ? AS id) t
           ON DUPLICATE KEY UPDATE in_stock=0, stock_count=0, updated_at=NOW()`,
          [id, id]
        );
        // Simpler: just update if exists, insert if not
        const base = (await import('@/lib/data')).getSimbaData().products.find(p => p.id === id);
        if (base) {
          await conn.execute(
            `INSERT INTO product_overrides (id, name, price, category, unit, image, in_stock, stock_count)
             VALUES (?, ?, ?, ?, ?, ?, 0, 0)
             ON DUPLICATE KEY UPDATE in_stock=0, stock_count=0, updated_at=NOW()`,
            [id, base.name, Math.round(base.price), base.category, base.unit ?? 'Pcs', base.image ?? '']
          );
        }
      }
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
