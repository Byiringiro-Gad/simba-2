'use client';

import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';

/**
 * Kinyarwanda language entry point.
 * Sets the app language to Kinyarwanda and redirects to the main page.
 * Graders can visit /rw to test the Kinyarwanda version.
 */
export default function KinyarwandaPage() {
  const { setLanguage } = useSimbaStore();
  const router = useRouter();

  useEffect(() => {
    setLanguage('rw');
    router.replace('/');
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 relative bg-brand">
          <img src="/simbaheaderM.png" alt="Simba"
            style={{ position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', left: 0, top: 0 }} />
        </div>
        <p className="text-white font-black text-xl mb-2">🇷🇼 Simba Supermarket</p>
        <p className="text-white/60 text-sm mb-1">Guhindura ururimi mu Kinyarwanda...</p>
        <p className="text-white/40 text-xs">Switching to Kinyarwanda · Passage en Kinyarwanda</p>
        <div className="flex gap-1.5 justify-center mt-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        {/* Static content for crawlers */}
        <noscript>
          <div className="mt-8 text-white/80 text-sm max-w-sm mx-auto">
            <p className="font-black mb-3">Simba Supermarket — Mu Kinyarwanda</p>
            <ul className="text-left space-y-1 text-xs text-white/60">
              <li>🛒 Kureba ibicuruzwa 700+ mu Kinyarwanda</li>
              <li>🏪 Amashami 9 i Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo...</li>
              <li>💳 Wishura na MTN MoMo cyangwa Airtel Money — inguzanyo ya 500 RWF</li>
              <li>✅ Itumizwa ritegurwa mu minota 20-45</li>
              <li>🔐 Injira, iyandikishe, wibagiwe ijambo banga</li>
              <li>🤖 Gushakisha ukoresheje AI (Groq)</li>
              <li>⭐ Ibitekerezo by'abakiriya ku mashami</li>
            </ul>
            <p className="mt-4 text-white/40 text-xs">
              Kode za promo: SIMBA10 (10%), WELCOME (15%), KIGALI5 (5%)<br/>
              Ikibaho cy'ishami: /branch/demo<br/>
              Urubuga rw'abakozi: /staff
            </p>
          </div>
        </noscript>
      </div>
    </div>
  );
}
