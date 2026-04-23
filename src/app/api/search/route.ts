import { NextRequest, NextResponse } from 'next/server';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Groq is OpenAI-compatible — use fetch directly, no extra package needed
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function POST(req: NextRequest) {
  try {
    const { query, language = 'en' } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ ok: false, error: 'Query required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // Build a compact product catalog for context (name, category, price)
    const { products } = getSimbaData();
    const catalog = products
      .slice(0, 200) // keep prompt size reasonable
      .map(p => `${p.id}|${p.name}|${p.category}|${p.price}RWF|${p.inStock ? 'in stock' : 'out of stock'}`)
      .join('\n');

    const systemPrompt = `You are a smart product search assistant for Simba Supermarket in Kigali, Rwanda.
The user will ask for products in natural language (English, French, or Kinyarwanda).
You must respond in the SAME language the user used.

Here is the product catalog (id|name|category|price|stock):
${catalog}

Your job:
1. Understand what the user is looking for
2. Return a short friendly message (1-2 sentences max) in the user's language
3. Return a JSON array of matching product IDs (up to 8 best matches)

ALWAYS respond in this exact JSON format:
{
  "message": "your friendly response here",
  "productIds": [1, 2, 3]
}

If nothing matches, return productIds: [] and suggest alternatives.
Do NOT include any text outside the JSON.`;

    if (!apiKey) {
      // Fallback: keyword search without AI
      const q = query.toLowerCase();
      const matched = products
        .filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        )
        .slice(0, 8);

      const fallbackMsg =
        language === 'fr'
          ? matched.length > 0
            ? `${matched.length} produit(s) trouvé(s) pour "${query}"`
            : `Aucun produit trouvé pour "${query}"`
          : language === 'rw'
          ? matched.length > 0
            ? `Ibisubizo ${matched.length} bya "${query}"`
            : `Nta bicuruzwa bibonetse bya "${query}"`
          : matched.length > 0
          ? `Found ${matched.length} product(s) for "${query}"`
          : `No products found for "${query}"`;

      return NextResponse.json({
        ok: true,
        message: fallbackMsg,
        products: matched,
        usedAI: false,
      });
    }

    // Call Groq
    const groqRes = await fetch(GROQ_API_URL, {
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
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!groqRes.ok) {
      throw new Error(`Groq API error: ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    const raw = groqData.choices?.[0]?.message?.content ?? '{}';

    // Parse the JSON response from Groq
    let parsed: { message: string; productIds: number[] };
    try {
      // Extract JSON even if there's surrounding text
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      parsed = { message: raw, productIds: [] };
    }

    // Map product IDs back to full product objects
    const matchedProducts = (parsed.productIds ?? [])
      .map((id: number) => products.find(p => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      message: parsed.message ?? '',
      products: matchedProducts,
      usedAI: true,
    });
  } catch (err: any) {
    console.error('[POST /api/search]', err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
