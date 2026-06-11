import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const jar = await cookies();
  const session = jar.get('admin_session');
  return session?.value === 'authenticated';
}

async function ensureSettingsTable(conn: any) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key_name   VARCHAR(100) PRIMARY KEY,
      value      TEXT         NOT NULL,
      updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

const DEFAULTS: Record<string, string> = {
  deposit_amount:         '500',
  loyalty_earn_rate:      '100',   // 1 pt per X RWF
  loyalty_bronze_max:     '199',
  loyalty_silver_max:     '499',
  feature_flash_deals:    'true',
  feature_deals_of_day:   'true',
  feature_trending:       'true',
  feature_buy_it_again:   'true',
  feature_compare:        'true',
  feature_reviews:        'true',
  feature_referrals:      'true',
  flash_deal_duration_h:  '4',
  pickup_time_min:        '20',
  pickup_time_max:        '45',
  store_open_hour:        '8',
  store_close_hour:       '21',
};

export async function GET(req: NextRequest) {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureSettingsTable(conn);
      const [rows] = await conn.execute('SELECT key_name, value FROM site_settings') as any[];
      const settings: Record<string, string> = { ...DEFAULTS };
      for (const row of (rows as any[])) {
        settings[row.key_name] = row.value;
      }
      return NextResponse.json({ ok: true, settings });
    } finally { conn.release(); }
  } catch {
    return NextResponse.json({ ok: true, settings: DEFAULTS });
  }
}

export async function PATCH(req: NextRequest) {
  if (!await verifyAdmin()) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  try {
    const updates: Record<string, string> = await req.json();
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await ensureSettingsTable(conn);
      for (const [key, value] of Object.entries(updates)) {
        await conn.execute(
          `INSERT INTO site_settings (key_name, value, updated_at) VALUES (?, ?, NOW())
           ON CONFLICT (key_name) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, String(value)]
        );
      }
      return NextResponse.json({ ok: true });
    } finally { conn.release(); }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
