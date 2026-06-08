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

    // ── No API key → smart keyword fallback ─────────────────────────────────
    if (!apiKey) {
      return keywordFallback(query, language, products);
    }

    // ── Groq AI search ───────────────────────────────────────────────────────
    const systemPrompt = `You are a product search assistant for Simba Supermarket in Kigali, Rwanda.
The user will ask for products in natural language (English, French, or Kinyarwanda).
Respond in the SAME language the user used.

You must understand natural language queries including:
- Synonyms and similar words (e.g. "milk" matches "Fresh Milk", "Dairy Milk", "Long Life Milk")
- Category queries (e.g. "cleaning stuff" matches Cleaning & Sanitary category)
- Price conditions (e.g. "cheap", "under 2000 RWF", "less than 5000")
- Partial words (e.g. "chick" matches "Chicken")
- Mixed language (e.g. "lait" is French for milk, "amata" is Kinyarwanda for milk)
- Related items (e.g. "breakfast" could match bread, eggs, milk, juice, yogurt)

Product catalog (id|name|category|price):
${catalog}

Instructions:
1. Understand what the user wants — consider synonyms, related words, category matches, price conditions
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

    // If AI returned nothing, fall back
    if (matched.length === 0) {
      return keywordFallback(query, language, products);
    }

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

// ── Smart keyword fallback — fuzzy + synonyms + price ────────────────────────
function keywordFallback(query: string, language: string, products: any[]) {
  const q = query.toLowerCase().trim();

  // Price condition detection
  const priceMatch = q.match(/under\s*(\d+)|less\s*than\s*(\d+)|moins\s*de\s*(\d+)/i);
  const maxPrice = priceMatch
    ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3])
    : null;
  const isCheap = /cheap|affordable|bon march[eé]|buhoro/i.test(q);

  // Synonym map
  const synonyms: Record<string, string[]> = {
    milk:      ['milk', 'lait', 'amata', 'dairy'],
    bread:     ['bread', 'pain', 'umugati', 'bakery'],
    water:     ['water', 'eau', 'amazi'],
    juice:     ['juice', 'jus', 'umusoki'],
    eggs:      ['egg', 'eggs', 'oeuf', 'amagi'],
    rice:      ['rice', 'riz', 'umuceli'],
    oil:       ['oil', 'huile', 'amavuta'],
    soap:      ['soap', 'savon', 'isabuni', 'cleaning'],
    chicken:   ['chicken', 'poulet', 'inkoko'],
    sugar:     ['sugar', 'sucre', 'isukari'],
    flour:     ['flour', 'farine', 'ufu'],
    yogurt:    ['yogurt', 'yaourt'],
    baby:      ['baby', 'bébé', 'uruhinja', 'infant'],
    breakfast: ['bread', 'milk', 'egg', 'juice', 'yogurt', 'cereal'],
    cleaning:  ['cleaning', 'sanitary', 'hygiene', 'soap', 'detergent'],
    cosmetics: ['cosmetic', 'beauty', 'skin', 'hair', 'lotion'],
    drink:     ['juice', 'water', 'soda', 'beverage', 'drink'],
    snack:     ['snack', 'chips', 'biscuit', 'cookie'],
  };

  const words = q.split(/\s+/).filter(w => w.length > 1);
  const searchTerms = new Set<string>(words);

  for (const variants of Object.values(synonyms)) {
    if (variants.some(v => q.includes(v))) {
      variants.forEach(v => searchTerms.add(v));
    }
  }

  let matched = products.filter(p => {
    const name = p.name.toLowerCase();
    const cat  = p.category.toLowerCase();
    const textMatch  = [...searchTerms].some(t => name.includes(t) || cat.includes(t));
    const priceOk    = maxPrice ? p.price <= maxPrice : true;
    const cheapOk    = isCheap  ? p.price <= 3000     : true;
    return textMatch && priceOk && cheapOk;
  });

  // Partial match fallback (first 3 chars)
  if (matched.length === 0) {
    matched = products.filter(p =>
      words.some(w => w.length >= 3 && p.name.toLowerCase().includes(w.slice(0, 3)))
    );
  }

  matched = matched.slice(0, 8);

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

  return NextResponse.json({ ok: true, message, products: matched, usedAI: false });
}
