import { NextRequest, NextResponse } from 'next/server';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are Pulse, the friendly AI assistant for Simba Supermarket in Kigali, Rwanda.
You are helpful, warm, and knowledgeable. You can answer ANY question — products, recipes, general knowledge, advice, etc.

Key facts about Simba:
- 9 branches across Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Pickup ready in 20-45 minutes — customer selects branch and picks up their order
- Accepts MTN MoMo and Airtel Money — 500 RWF deposit required at checkout
- 700+ products: Groceries, Bakery, Cosmetics, Baby Products, Kitchenware, Electronics, Sports, Alcoholic Beverages, Cleaning & Sanitary, Kitchen Storage, Pet Care
- Loyalty points: 1 point per 100 RWF spent. 200 pts = Silver, 500 pts = Gold
- Promo codes: SIMBA10 (10% off), WELCOME (15% off), KIGALI5 (5% off)
- Website: simbaonlineshopping.com

IMPORTANT: Always respond in the SAME language the user writes in (English, French, or Kinyarwanda).
Keep responses concise, friendly, and helpful. Use emojis sparingly.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: '__NO_API_KEY__' },
        { status: 200 }
      );
    }

    // Build clean message history for Groq
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .slice(-10) // keep last 10 messages for context
        .map((m: any) => ({
          role: m.role,
          content: m.content ?? m.text ?? '',
        })),
    ];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Groq chat error]', res.status, err);
      return NextResponse.json({ message: '__NO_API_KEY__' }, { status: 200 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ message: text });
  } catch (err: any) {
    console.error('[POST /api/chat]', err.message);
    return NextResponse.json({ message: '__NO_API_KEY__' }, { status: 200 });
  }
}
