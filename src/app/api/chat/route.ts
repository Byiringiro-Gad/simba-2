import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_CONTEXT = `You are Pulse, the AI assistant for Simba Supermarket in Kigali, Rwanda.
You are helpful, friendly, and knowledgeable. You can answer ANY question — general knowledge, recipes, advice, math, science, history, etc.

When the topic relates to Simba Supermarket, use these facts:
- 8 branches across Kigali, Rwanda
- Delivers in 45 minutes across Kigali
- Accepts MTN MoMo and Airtel Money
- 700+ products: Groceries, Bakery, Cosmetics, Baby Products, Kitchenware, Electronics, Sports, Alcoholic Beverages, Cleaning & Sanitary, Kitchen Storage, Pet Care
- Loyalty points: 1 point per 100 RWF spent. 200 pts = Silver, 500 pts = Gold
- Promo codes: SIMBA10 (10% off), WELCOME (15% off), KIGALI5 (5% off)
- Website: simbaonlineshopping.com

Always respond in the same language the user writes in (English, French, or Kinyarwanda).
Keep responses concise and helpful.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, language } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({
        message: 'AI service not configured. Add GEMINI_API_KEY to .env.local',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Filter to only user messages for the actual query
    // Gemini history must be strictly alternating user/model pairs
    // Build clean history from the conversation (skip initial AI greeting)
    const userMessages = messages.filter((m: { role: string; content: string }) => m.role === 'user');
    const allMessages = messages.filter((m: { role: string; content: string }) =>
      // Skip the very first assistant message (greeting)
      !(m.role === 'assistant' && messages.indexOf(m) === 0)
    );

    // Build valid alternating history (all except the last user message)
    const historyMessages = allMessages.slice(0, -1);
    const lastUserMessage = allMessages[allMessages.length - 1];

    // Ensure history starts with user and alternates properly
    const cleanHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    let expectedRole: 'user' | 'model' = 'user';

    for (const msg of historyMessages) {
      const msgRole = msg.role === 'assistant' ? 'model' : 'user';
      if (msgRole === expectedRole) {
        cleanHistory.push({ role: msgRole, parts: [{ text: msg.content }] });
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }

    // Prepend system context to the first user message if history is empty
    const userText = cleanHistory.length === 0
      ? `[Context: ${SYSTEM_CONTEXT}]\n\nUser: ${lastUserMessage.content}`
      : lastUserMessage.content;

    const chat = model.startChat({
      history: cleanHistory.length > 0 ? cleanHistory : undefined,
      systemInstruction: SYSTEM_CONTEXT,
    });

    const result = await chat.sendMessage(userText);
    const text = result.response.text();

    return NextResponse.json({ message: text });

  } catch (error: any) {
    // Log the real error for debugging
    const errMsg = error?.message ?? String(error);
    console.error('[Gemini Error]', errMsg);

    // Return a user-friendly message with the actual error in dev
    return NextResponse.json(
      {
        message: process.env.NODE_ENV === 'development'
          ? `AI Error: ${errMsg}`
          : 'Sorry, something went wrong. Please try again.',
      },
      { status: 500 }
    );
  }
}
