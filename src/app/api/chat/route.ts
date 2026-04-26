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
- Website: simbaonlineshopping.com

Faits clés sur Simba (Français):
- 9 agences à Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Retrait prêt en 20-45 minutes — le client choisit une agence et retire sa commande
- Accepte MTN MoMo et Airtel Money — dépôt de 500 RWF requis à la caisse
- 700+ produits: Épicerie, Boulangerie, Cosmétiques, Produits bébé, Cuisine, Électronique, Sport, Boissons alcoolisées, Nettoyage, Rangement cuisine, Animaux
- Points de fidélité: 1 point par 100 RWF dépensés. 200 pts = Argent, 500 pts = Or
- Codes promo: SIMBA10 (10%), WELCOME (15%), KIGALI5 (5%)

Amakuru y'ingenzi kuri Simba (Kinyarwanda):
- Amashami 9 i Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Itumizwa ritegurwa mu minota 20-45 — umukiriya ahitamo ishami maze afate ibicuruzwa bye
- Wishurwa na MTN MoMo na Airtel Money — inguzanyo ya 500 RWF irasabwa igihe wishura
- Ibicuruzwa 700+: Ibiribwa, Ufu, Ibicuruzwa byo kwisukura, Ibicuruzwa by'umwana, Ibikoresho bya kicheni, Ikoranabuhanga, Siporo, Inzoga, Isuku, Ibigega bya kicheni, Inyamaswa
- Amanota y'ubudahemuka: amanota 1 kuri RWF 100 wishyuye. 200 pts = Ifeza, 500 pts = Zahabu
- Kode za promo: SIMBA10 (10%), WELCOME (15%), KIGALI5 (5%)

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
