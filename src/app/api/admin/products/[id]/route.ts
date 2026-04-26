
import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { name, price, category, unit, image, inStock, stockCount, description } = await req.json();
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      if (id > 900000) {
        await conn.execute(
          `UPDATE product_additions
           SET name=?, price=?, category=?, unit=?, image=?, in_stock=?, stock_count=?, description=?, updated_at=NOW()
           WHERE id=?`,
          [name, Math.round(price), category, unit ?? 'Pcs', image ?? '', inStock ? true : false, stockCount ?? 100, description ?? null, id - 900000]
        );
      } else {
        const base = getSimbaData().products.find(p => p.id === id);
        await conn.execute(
          `INSERT INTO product_overrides (id, name, price, category, unit, image, in_stock, stock_count, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (id) DO UPDATE SET
             name=EXCLUDED.name, price=EXCLUDED.price, category=EXCLUDED.category,
             unit=EXCLUDED.unit, image=EXCLUDED.image, in_stock=EXCLUDED.in_stock,
             stock_count=EXCLUDED.stock_count, description=EXCLUDED.description, updated_at=NOW()`,
          [
            id,
            name ?? base?.name ?? '',
            Math.round(price ?? base?.price ?? 0),
            category ?? base?.category ?? '',
            unit ?? base?.unit ?? 'Pcs',
            image ?? base?.image ?? '',
            inStock !== undefined ? (inStock ? true : false) : (base?.inStock ?? true),
            stockCount ?? base?.stockCount ?? 100,
            description ?? null,
          ]
        );
      }
      return NextResponse.json({ ok: true });
    } finally {
      conn.release();
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      if (id > 900000) {
        await conn.execute('DELETE FROM product_additions WHERE id = ?', [id - 900000]);
      } else {
        const base = getSimbaData().products.find(p => p.id === id);
        if (base) {
          await conn.execute(
            `INSERT INTO product_overrides (id, name, price, category, unit, image, in_stock, stock_count)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET in_stock=false, stock_count=0, updated_at=NOW()`,
            [id, base.name, Math.round(base.price), base.category, base.unit ?? 'Pcs', base.image ?? '', false, 0]
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
