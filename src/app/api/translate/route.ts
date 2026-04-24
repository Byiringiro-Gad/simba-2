import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Cache translations in memory to avoid repeated API calls
const cache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || targetLang === 'en') {
      return NextResponse.json({ ok: true, translated: text });
    }

    const cacheKey = `${targetLang}:${text}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json({ ok: true, translated: cache.get(cacheKey) });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: true, translated: text }); // fallback to original
    }

    const langName = targetLang === 'fr' ? 'French' : 'Kinyarwanda';

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a product name translator for a Rwandan supermarket. Translate product names to ${langName}. Return ONLY the translated name, nothing else. Keep brand names, measurements (ml, kg, g, L) and numbers unchanged. If a word has no translation, keep it in English.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: true, translated: text });
    }

    const data = await res.json();
    const translated = data.choices?.[0]?.message?.content?.trim() ?? text;
    cache.set(cacheKey, translated);

    return NextResponse.json({ ok: true, translated });
  } catch {
    return NextResponse.json({ ok: true, translated: req.body });
  }
}
