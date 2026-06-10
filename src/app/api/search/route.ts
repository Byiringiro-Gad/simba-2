import { NextRequest, NextResponse } from 'next/server';
import { Language } from '@/types';
import { getSimbaData } from '@/lib/data';
import { resolveProductsByNames, smartSearchProducts } from '@/lib/smartSearch';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function extractJsonPayload(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1] ?? raw;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start >= 0 && end > start) {
    return candidate.slice(start, end + 1).trim();
  }

  return candidate.trim();
}

export async function POST(req: NextRequest) {
  let query = '';
  let language: Language = 'en';

  try {
    const body = await req.json();
    query = body?.query ?? '';
    language = body?.language ?? 'en';
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 });
  }

  if (!query?.trim()) {
    return NextResponse.json({ ok: false, error: 'Query required' }, { status: 400 });
  }

  const { products } = getSimbaData();
  const fallback = smartSearchProducts(query, products, language);
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      message: fallback.message,
      products: fallback.products,
      usedAI: false,
    });
  }

  const catalog = products
    .map(p => `${p.name} [${p.category}] ${p.price} RWF`)
    .join('\n');

  const systemPrompt = `You are Simba Search Assistant for Simba Supermarket in Kigali, Rwanda.
You answer in the same language as the user: English, French, or Kinyarwanda.
Your job is to understand the full meaning of the query, not just single keywords.

Behavior:
- Answer naturally and briefly, like a helpful shopping assistant.
- If the user is asking about products or categories, include matching product names from the catalog.
- If the user is asking a general question, answer it normally and leave productNames empty.
- Use only exact product names from the catalog when returning products.
- Do not invent products.
- Do not rely on keyword matching alone. Read the whole sentence and infer intent.

Catalog:
${catalog}

Return only JSON in this exact format:
{"message":"short friendly reply","productNames":["Exact product name 1","Exact product name 2"]}

If no products are relevant, use:
{"message":"short friendly reply","productNames":[]}`;

  try {
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
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({
        ok: true,
        message: fallback.message,
        products: fallback.products,
        usedAI: false,
      });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    let parsed: { message?: string; productNames?: string[] };
    try {
      parsed = JSON.parse(extractJsonPayload(raw));
    } catch {
      return NextResponse.json({
        ok: true,
        message: fallback.message,
        products: fallback.products,
        usedAI: false,
      });
    }

    const requestedNames = Array.isArray(parsed.productNames)
      ? parsed.productNames.map(name => String(name).trim()).filter(Boolean).slice(0, 8)
      : [];

    if (requestedNames.length === 0) {
      return NextResponse.json({
        ok: true,
        message: parsed.message?.trim() || fallback.message,
        products: [],
        usedAI: true,
      });
    }

    const matched = resolveProductsByNames(requestedNames, products);
    const productsToShow = matched.length > 0 ? matched : fallback.products;

    return NextResponse.json({
      ok: true,
      message: parsed.message?.trim() || fallback.message,
      products: productsToShow,
      usedAI: true,
    });
  } catch (err: any) {
    console.error('[POST /api/search]', err.message);
    return NextResponse.json({
      ok: true,
      message: fallback.message,
      products: fallback.products,
      usedAI: false,
    });
  }
}
