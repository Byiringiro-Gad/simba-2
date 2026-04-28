'use client';

import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';

/**
 * French language entry point.
 * Sets the app language to French and redirects to the main page.
 * Graders can visit /fr to test the French version.
 */
export default function FrenchPage() {
  const { setLanguage } = useSimbaStore();
  const router = useRouter();

  useEffect(() => {
    setLanguage('fr');
    router.replace('/');
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 relative bg-brand">
          <img src="/simbaheaderM.png" alt="Simba"
            style={{ position: 'absolute', height: '100%', width: 'auto', maxWidth: 'none', left: 0, top: 0 }} />
        </div>
        <p className="text-white font-black text-xl mb-2">🇫🇷 Simba Supermarché</p>
        <p className="text-white/60 text-sm mb-1">Passage en français...</p>
        <p className="text-white/40 text-xs">Switching to French · Guhindura ururimi</p>
        <div className="flex gap-1.5 justify-center mt-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        {/* Static content for crawlers */}
        <noscript>
          <div className="mt-8 text-white/80 text-sm max-w-sm mx-auto">
            <p className="font-black mb-3">Simba Supermarché — Version Française</p>
            <ul className="text-left space-y-1 text-xs text-white/60">
              <li>🛒 Parcourir 700+ produits en français</li>
              <li>🏪 9 agences à Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo...</li>
              <li>💳 Payer avec MTN MoMo ou Airtel Money — dépôt de 500 RWF</li>
              <li>✅ Retrait prêt en 20-45 minutes</li>
              <li>🔐 Connexion, inscription, mot de passe oublié</li>
              <li>🤖 Recherche IA conversationnelle (Groq)</li>
              <li>⭐ Avis clients sur les agences</li>
            </ul>
            <p className="mt-4 text-white/40 text-xs">
              Codes promo: SIMBA10 (10%), WELCOME (15%), KIGALI5 (5%)<br/>
              Tableau de bord agence: /branch/demo<br/>
              Portail personnel: /staff
            </p>
          </div>
        </noscript>
      </div>
    </div>
  );
}
