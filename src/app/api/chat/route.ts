import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI — key comes from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are Pulse, the AI shopping assistant for Simba Supermarket in Kigali, Rwanda.
You help customers find products, suggest recipes using products available at Simba, answer questions about delivery, payment (MTN MoMo, Airtel Money), store locations, and anything related to grocery shopping in Rwanda.

Key facts about Simba Supermarket:
- Located in Kigali, Rwanda with 8 branches
- Delivers in 45 minutes across Kigali
- Accepts MTN MoMo and Airtel Money payments
- Has 700+ products across categories: Groceries, Bakery, Cosmetics, Baby Products, Household, Electronics, Sports, Alcoholic Beverages
- Loyalty points: earn 1 point per 100 RWF spent
- Promo codes: SIMBA10 (10% off), WELCOME (15% off), KIGALI5 (5% off)

You respond in the same language the user writes in (English, French, or Kinyarwanda).
Keep responses concise, friendly, and helpful. Focus on Simba products and services.
If asked about something unrelated to shopping or Simba, politely redirect to shopping topics.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      // Fallback if no API key configured
      return NextResponse.json({
        message: language === 'rw'
          ? "Mbabarira, serivisi ya AI ntiboneka ubu. Gerageza nyuma."
          : language === 'fr'
          ? "Désolé, le service IA n'est pas disponible pour le moment. Réessayez plus tard."
          : "Sorry, AI service is not available right now. Please try again later.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content ?? 'Sorry, I could not process that.';

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { message: 'Sorry, something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
