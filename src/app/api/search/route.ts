import { NextRequest, NextResponse } from 'next/server';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const STOP_WORDS = new Set([
  'do', 'you', 'have', 'i', 'a', 'an', 'the', 'is', 'are', 'want', 'need',
  'show', 'me', 'give', 'get', 'find', 'looking', 'for', 'any', 'some', 'please',
  'can', 'we', 'what', 'which', 'where', 'how', 'much', 'many', 'there', 'with',
  'and', 'or', 'of', 'in', 'on', 'to', 'it', 'be', 'this', 'that',
]);

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en' } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ ok: false, error: 'Query required' }, { status: 400 });
    }

    const { products } = getSimbaData();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return keywordFallback(query, language, products);
    }

    // Send name + category only — much smaller than full catalog
    // Group by category so Groq understands the structure
    const catalog = products
      .map(p => `${p.name} [${p.category}] ${p.price}RWF`)
      .join('\n');

    const systemPrompt = `You are a smart product search assistant for Simba Supermarket in Kigali, Rwanda.
The user sends a natural language query in English, French, or Kinyarwanda.
Your job is to understand the full meaning of the query and find matching products.

Rules:
- Understand questions like "do you have milk?" = search for milk products
- Understand "something cheap for breakfast" = low-price breakfast items (bread, eggs, milk, juice)
- Understand French: "lait" = milk, "pain" = bread, "eau" = water
- Understand Kinyarwanda: "amata" = milk, "umugati" = bread, "amazi" = water
- Match by category too: "cleaning products", "baby stuff", "cosmetics" etc.
- If price mentioned (e.g. "under 5000 RWF"), only include products within that range

Product catalog (name [category] price):
${catalog}

Respond ONLY in this exact JSON format, no markdown, no extra text:
{"message":"short friendly reply in the same language the user used","productNames":["exact product name 1","exact product name 2"]}

Return up to 8 product names. Use the EXACT names from the catalog.
If nothing matches respond: {"message":"...","productNames":[]}`;

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
        temperature: 0.1,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      console.error('[Groq search error]', res.status);
      return keywordFallback(query, language, products);
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    let parsed: { message: string; productNames: string[] };
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      console.error('[Groq parse error]', raw);
      return keywordFallback(query, language, products);
    }

    // Match returned names back to actual products (exact + fuzzy)
    const matched = (parsed.productNames ?? [])
      .map((name: string) => {
        const lower = name.toLowerCase();
        // Try exact match first
        let found = products.find(p => p.name.toLowerCase() === lower);
        // Fall back to includes match
        if (!found) found = products.find(p => p.name.toLowerCase().includes(lower) || lower.includes(p.name.toLowerCase()));
        return found;
      })
      .filter(Boolean);

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

// ── Keyword fallback ──────────────────────────────────────────────────────────
function keywordFallback(query: string, language: string, products: any[]) {
  const q = query.toLowerCase().trim();

  const priceMatch = q.match(/under\s*(\d+)|less\s*than\s*(\d+)|moins\s*de\s*(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) : null;
  const isCheap = /cheap|affordable|bon march[eé]|buhoro/i.test(q);

  const synonyms: Record<string, string[]> = {
    milk:      ['milk', 'lait', 'amata', 'dairy', 'lactogen'],
    bread:     ['bread', 'pain', 'umugati'],
    water:     ['water', 'eau', 'amazi'],
    juice:     ['juice', 'jus'],
    egg:       ['egg', 'eggs', 'oeuf', 'amagi'],
    rice:      ['rice', 'riz', 'umuceli'],
    oil:       ['oil', 'huile', 'amavuta'],
    soap:      ['soap', 'savon', 'isabuni'],
    chicken:   ['chicken', 'poulet', 'inkoko'],
    sugar:     ['sugar', 'sucre', 'isukari'],
    yogurt:    ['yogurt', 'yaourt'],
    baby:      ['baby', 'infant', 'uruhinja'],
    cleaning:  ['cleaning', 'sanitary', 'detergent'],
    cosmetics: ['cosmetic', 'beauty', 'lotion', 'shampoo', 'cream'],
    breakfast: ['bread', 'milk', 'egg', 'juice', 'yogurt'],
  };

  // Strip stop words
  const words = q.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length === 0) {
    return NextResponse.json({ ok: true, message: `No products found for "${query}".`, products: [], usedAI: false });
  }

  const searchTerms = new Set<string>(words);
  for (const variants of Object.values(synonyms)) {
    if (variants.some(v => words.some(w => v.includes(w) || w.includes(v)))) {
      variants.forEach(v => searchTerms.add(v));
    }
  }

  const terms = Array.from(searchTerms);
  const matched = products.filter(p => {
    const name = p.name.toLowerCase();
    const cat  = p.category.toLowerCase();
    const textMatch = terms.some(t => name.includes(t) || cat.includes(t));
    const priceOk   = maxPrice ? p.price <= maxPrice : true;
    const cheapOk   = isCheap  ? p.price <= 3000     : true;
    return textMatch && priceOk && cheapOk;
  }).slice(0, 8);

  const message =
    language === 'fr'
      ? matched.length > 0 ? `${matched.length} produit(s) pour "${query}"` : `Aucun résultat pour "${query}".`
      : language === 'rw'
      ? matched.length > 0 ? `Ibisubizo ${matched.length} bya "${query}"` : `Nta bicuruzwa bya "${query}".`
      : matched.length > 0 ? `Found ${matched.length} product(s) for "${query}"` : `No products found for "${query}".`;

  return NextResponse.json({ ok: true, message, products: matched, usedAI: false });
}
