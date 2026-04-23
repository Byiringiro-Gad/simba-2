import { NextRequest, NextResponse } from 'next/server';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en' } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ ok: false, error: 'Query required' }, { status: 400 });
    }

    const { products } = getSimbaData();

    // Compact catalog — id, name, category, price
    const catalog = products
      .map(p => `${p.id}|${p.name}|${p.category}|${p.price}RWF`)
      .join('\n');

    const apiKey = process.env.GROQ_API_KEY;

    // ── No API key → fast keyword fallback ──────────────────────────────────
    if (!apiKey) {
      return keywordFallback(query, language, products);
    }

    // ── Groq AI search ───────────────────────────────────────────────────────
    const systemPrompt = `You are a product search assistant for Simba Supermarket in Kigali, Rwanda.
The user will ask for products in natural language (English, French, or Kinyarwanda).
Respond in the SAME language the user used.

Product catalog (id|name|category|price):
${catalog}

Instructions:
1. Understand what the user wants
2. Return a short friendly message (1-2 sentences) in the user's language
3. Return up to 8 best matching product IDs as a JSON array

Respond ONLY with this exact JSON format, no other text:
{"message":"your response here","productIds":[1,2,3]}

If nothing matches, return {"message":"...","productIds":[]}`;

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.2,
        max_tokens: 256,
      }),
    });

    if (!res.ok) {
      console.error('[Groq search error]', res.status);
      return keywordFallback(query, language, products);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';

    // Parse Groq response
    let parsed: { message: string; productIds: number[] };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      return keywordFallback(query, language, products);
    }

    const matched = (parsed.productIds ?? [])
      .map((id: number) => products.find(p => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      message: parsed.message ?? '',
      products: matched,
      usedAI: true,
    });
  } catch (err: any) {
    console.error('[POST /api/search]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// ── Keyword fallback (no API key needed) ─────────────────────────────────────
function keywordFallback(query: string, language: string, products: any[]) {
  const q = query.toLowerCase();
  const matched = products
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
    .slice(0, 8);

  const message =
    language === 'fr'
      ? matched.length > 0
        ? `${matched.length} produit(s) trouvé(s) pour "${query}"`
        : `Aucun produit trouvé pour "${query}". Essayez un autre terme.`
      : language === 'rw'
      ? matched.length > 0
        ? `Ibisubizo ${matched.length} bya "${query}"`
        : `Nta bicuruzwa bibonetse bya "${query}". Gerageza ijambo rindi.`
      : matched.length > 0
      ? `Found ${matched.length} product(s) for "${query}"`
      : `No products found for "${query}". Try a different search.`;

  return NextResponse.json({
    ok: true,
    message,
    products: matched,
    usedAI: false,
  });
}
