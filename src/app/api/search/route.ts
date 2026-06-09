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

  const priceMatch = q.match(/under\s*(\d+)|less\s*than\s*(\d+)|moins\s*de\s*(\d+)|munsi\s*ya\s*(\d+)/i);
  const maxPrice = priceMatch
    ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4])
    : null;
  const isCheap = /cheap|affordable|bon march[eé]|buhoro|inexpensive|low.?cost/i.test(q);

  // Intent patterns — map phrases to product keywords
  const intentMap: Array<{ pattern: RegExp; keywords: string[] }> = [
    { pattern: /breakfast|matin|petit.?d[eé]j|turahira/i,        keywords: ['bread', 'milk', 'egg', 'juice', 'yogurt', 'butter', 'cereal'] },
    { pattern: /baby|infant|uruhinja|enfant/i,                    keywords: ['baby', 'infant', 'lactogen', 'pampers', 'diaper'] },
    { pattern: /clean(ing)?|sanit|detergent|isuku/i,              keywords: ['soap', 'detergent', 'bleach', 'cleaning', 'sanitary'] },
    { pattern: /drink|beverage|boisson|ibiryo/i,                  keywords: ['juice', 'water', 'soda', 'drink', 'beer', 'wine'] },
    { pattern: /cook(ing)?|cuisine|guteka/i,                      keywords: ['oil', 'flour', 'spice', 'salt', 'tomato', 'onion', 'garlic'] },
    { pattern: /beauty|cosmetic|beaut[eé]|isukura/i,              keywords: ['shampoo', 'lotion', 'cream', 'soap', 'makeup', 'deodorant'] },
    { pattern: /snack|grignoter|ibiryo bito/i,                    keywords: ['biscuit', 'cracker', 'chip', 'chocolate', 'candy'] },
    { pattern: /dairy|laitiier|amata/i,                           keywords: ['milk', 'yogurt', 'butter', 'cheese', 'cream'] },
    { pattern: /meat|viande|inyama/i,                             keywords: ['beef', 'chicken', 'pork', 'fish', 'sausage', 'meat'] },
    { pattern: /vegetable|fruit|légume|imbuto/i,                  keywords: ['tomato', 'onion', 'carrot', 'cabbage', 'spinach', 'banana', 'mango'] },
    { pattern: /water|eau|amazi/i,                                keywords: ['water', 'mineral', 'still', 'sparkling'] },
    { pattern: /something (sweet|nice|good)|quelque chose/i,      keywords: ['juice', 'yogurt', 'biscuit', 'chocolate', 'cake'] },
  ];

  const synonyms: Record<string, string[]> = {
    milk:      ['milk', 'lait', 'amata', 'dairy', 'lactogen'],
    bread:     ['bread', 'pain', 'umugati', 'baguette'],
    water:     ['water', 'eau', 'amazi', 'mineral'],
    juice:     ['juice', 'jus', 'nectar'],
    egg:       ['egg', 'oeuf', 'amagi'],
    rice:      ['rice', 'riz', 'umuceli'],
    oil:       ['oil', 'huile', 'amavuta', 'cooking oil'],
    soap:      ['soap', 'savon', 'isabuni'],
    chicken:   ['chicken', 'poulet', 'inkoko'],
    sugar:     ['sugar', 'sucre', 'isukari'],
    yogurt:    ['yogurt', 'yaourt', 'ikirere'],
    tomato:    ['tomato', 'tomate', 'inyanya'],
    onion:     ['onion', 'oignon', 'katarazo'],
  };

  // Build search terms from query
  const words = q.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const searchTerms = new Set<string>(words);

  // Add intent-based keywords
  for (const intent of intentMap) {
    if (intent.pattern.test(q)) {
      intent.keywords.forEach(k => searchTerms.add(k));
    }
  }

  // Add synonym expansions
  for (const variants of Object.values(synonyms)) {
    if (variants.some(v => words.some(w => v.includes(w) || w.includes(v)))) {
      variants.forEach(v => searchTerms.add(v));
    }
  }

  const terms = Array.from(searchTerms);

  // Score products — more matching terms = higher score
  const scored = products
    .map(p => {
      const name = p.name.toLowerCase();
      const cat  = p.category.toLowerCase();
      const score = terms.filter(t => name.includes(t) || cat.includes(t)).length;
      const priceOk = maxPrice ? p.price <= maxPrice : true;
      const cheapOk = isCheap ? p.price <= 3000 : true;
      return { p, score, priceOk, cheapOk };
    })
    .filter(x => x.score > 0 && x.priceOk && x.cheapOk)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(x => x.p);

  const message =
    language === 'fr'
      ? scored.length > 0 ? `${scored.length} produit(s) pour "${query}"` : `Aucun résultat pour "${query}".`
      : language === 'rw'
      ? scored.length > 0 ? `Ibisubizo ${scored.length} bya "${query}"` : `Nta bicuruzwa bya "${query}".`
      : scored.length > 0 ? `Found ${scored.length} product(s) for "${query}"` : `No products found for "${query}".`;

  return NextResponse.json({ ok: true, message, products: scored, usedAI: false });
}
