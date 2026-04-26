import { NextRequest, NextResponse } from 'next/server';
import { getSimbaData } from '@/lib/data';

export const dynamic = 'force-dynamic';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are Pulse, the friendly AI assistant for Simba Supermarket in Kigali, Rwanda.
You are helpful, warm, and knowledgeable. You can answer ANY question — products, recipes, general knowledge, advice, etc.

Key facts about Simba (English):
- 9 branches across Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Pickup ready in 20-45 minutes — customer selects branch and picks up their order
- Accepts MTN MoMo and Airtel Money — 500 RWF deposit required at checkout
- 700+ products: Groceries, Bakery, Cosmetics, Baby Products, Kitchenware, Electronics, Sports, Alcoholic Beverages, Cleaning & Sanitary, Kitchen Storage, Pet Care
- Loyalty points: 1 point per 100 RWF spent. 200 pts = Silver, 500 pts = Gold
- Promo codes: SIMBA10 (10% off), WELCOME (15% off), KIGALI5 (5% off)

Faits clés sur Simba (Français):
- 9 agences à Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Retrait prêt en 20-45 minutes — dépôt de 500 RWF requis à la caisse
- Accepte MTN MoMo et Airtel Money
- Codes promo: SIMBA10 (10%), WELCOME (15%), KIGALI5 (5%)

Amakuru y'ingenzi kuri Simba (Kinyarwanda):
- Amashami 9 i Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Itumizwa ritegurwa mu minota 20-45 — inguzanyo ya 500 RWF irasabwa
- Wishurwa na MTN MoMo na Airtel Money
- Kode za promo: SIMBA10 (10%), WELCOME (15%), KIGALI5 (5%)

IMPORTANT INSTRUCTIONS:
1. Always respond in the SAME language the user writes in (English, French, or Kinyarwanda).
2. Keep responses concise and friendly.
3. When the user asks about specific products or categories, you MUST include a JSON block at the END of your response with relevant product search terms.
4. Format the product search block EXACTLY like this (only when products are relevant):
   [PRODUCTS:term1,term2,term3]
   Example: [PRODUCTS:milk,bread,eggs]
5. Do NOT include the [PRODUCTS:...] block for general questions about delivery, payment, locations, etc.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    const { products: allProducts } = getSimbaData();

    if (!apiKey) {
      return NextResponse.json({ message: '__NO_API_KEY__' }, { status: 200 });
    }

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m: any) => ({ role: m.role, content: m.content ?? m.text ?? '' })),
    ];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: groqMessages, temperature: 0.7, max_tokens: 512 }),
    });

    if (!res.ok) {
      return NextResponse.json({ message: '__NO_API_KEY__' }, { status: 200 });
    }

    const data = await res.json();
    let text: string = data.choices?.[0]?.message?.content ?? '';

    // Extract [PRODUCTS:...] block if present
    let productIds: number[] = [];
    const productMatch = text.match(/\[PRODUCTS:([^\]]+)\]/i);
    if (productMatch) {
      // Remove the tag from the displayed text
      text = text.replace(/\[PRODUCTS:[^\]]+\]/i, '').trim();

      const terms = productMatch[1].split(',').map((t: string) => t.trim().toLowerCase());
      const matched = allProducts
        .filter(p =>
          p.inStock &&
          terms.some(term =>
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
          )
        )
        .slice(0, 6);
      productIds = matched.map(p => p.id);
    }

    return NextResponse.json({
      message: text,
      productIds: productIds.length > 0 ? productIds : undefined,
    });
  } catch (err: any) {
    console.error('[POST /api/chat]', err.message);
    return NextResponse.json({ message: '__NO_API_KEY__' }, { status: 200 });
  }
}
