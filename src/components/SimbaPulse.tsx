'use client';

import { useState, useEffect, useRef } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { Sparkles, X, Send, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Product } from '@/types';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
  products?: Product[];
}

// ─── Smart Local AI Engine ────────────────────────────────────────────────────
// Works without any API key. Understands 20+ intents + product search.

function buildResponse(input: string, lang: string, products: Product[]): ChatMessage {
  const q = input.toLowerCase().trim();
  const pick = (en: string, fr: string, rw: string) => lang === 'fr' ? fr : lang === 'rw' ? rw : en;
  const findProducts = (terms: string[], limit = 4): Product[] =>
    products.filter(p => terms.some(t => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t))).slice(0, limit);

  // Greetings
  if (/^(hi|hello|hey|muraho|bonjour|salut|mwaramutse|mwiriwe|good morning|good afternoon)/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "Hello! 👋 I'm Pulse, your Simba AI assistant. I can help you find products, suggest recipes, answer questions about delivery, payment, or anything about Simba. What can I help you with?",
        "Bonjour ! 👋 Je suis Pulse, votre assistant IA Simba. Je peux vous aider à trouver des produits, suggérer des recettes, répondre à vos questions sur la livraison, le paiement ou tout ce qui concerne Simba. Comment puis-je vous aider ?",
        "Muraho! 👋 Ndi Pulse, umufasha wawe wa AI wa Simba. Nshobora kukufasha gushaka ibicuruzwa, gutanga ingero z'amafunguro, gusubiza ibibazo ku gutumiza, kwishura cyangwa ibyerekeye Simba. Nakufasha iki?"
      ),
    };
  }

  // Delivery
  if (/deliver|livr|gutumiz|time|igihe|fast|vuba|how long|combien|minutes|minota/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "🚴 Simba delivers across Kigali in **45 minutes**! We have 8 branches strategically located for fast delivery. Order now and track your rider in real time.",
        "🚴 Simba livre partout à Kigali en **45 minutes** ! Nous avons 8 agences pour une livraison rapide. Commandez maintenant et suivez votre livreur en temps réel.",
        "🚴 Simba itumiza mu Kigali hose mu **minota 45**! Dufite amashami 8 kugira ngo gutumiza bibe vuba. Tumiza ubu ukurikirane uwawe ugeza."
      ),
    };
  }

  // Payment
  if (/pay|momo|mobile money|airtel|mtn|kwishur|payer|payment|checkout/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "💳 Simba accepts **MTN MoMo** and **Airtel Money**. At checkout, select your provider, enter your phone number, and confirm the push notification. Simple and secure!",
        "💳 Simba accepte **MTN MoMo** et **Airtel Money**. Lors du paiement, choisissez votre opérateur, entrez votre numéro et confirmez la notification. Simple et sécurisé !",
        "💳 Simba yemera **MTN MoMo** na **Airtel Money**. Mu kwishura, hitamo umuryango wawe, injiza nimero yawe kandi emeza ubutumwa. Byoroshye kandi biringanye!"
      ),
    };
  }

  // Promo codes
  if (/promo|discount|code|coupon|offer|offre|igabanywa|kode|sale/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "🎁 Active promo codes:\n• **SIMBA10** — 10% off\n• **WELCOME** — 15% off (new users)\n• **KIGALI5** — 5% off\n\nEnter the code in your cart before checkout!",
        "🎁 Codes promo actifs :\n• **SIMBA10** — 10% de réduction\n• **WELCOME** — 15% (nouveaux utilisateurs)\n• **KIGALI5** — 5% de réduction\n\nEntrez le code dans votre panier !",
        "🎁 Amakode ya promo:\n• **SIMBA10** — 10% igabanywa\n• **WELCOME** — 15% (abakoresha bashya)\n• **KIGALI5** — 5% igabanywa\n\nShyira kode mu gitebo!"
      ),
    };
  }

  // Loyalty
  if (/point|loyalt|fidél|ubudahemuka|reward|earn/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "⭐ Earn **1 point for every 100 RWF** spent. Reach 200 points for Silver, 500 for Gold status. Points are tracked automatically in your account!",
        "⭐ Gagnez **1 point pour 100 RWF** dépensés. Atteignez 200 points pour Argent, 500 pour Or. Les points sont suivis automatiquement !",
        "⭐ Unguka **amanota 1 kuri RWF 100** wishura. Gera ku manota 200 kugira ngo ubone Ifeza, 500 kugira ngo ubone Zahabu!"
      ),
    };
  }

  // Locations
  if (/locat|branch|where|kigali|aho|agence|kimironko|nyamirambo|remera|store/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "📍 Simba has **8 branches across Kigali**: Kimironko, Remera, Nyamirambo, and more. See all locations on the map on our homepage. We deliver to your door in 45 minutes!",
        "📍 Simba a **8 agences à Kigali** : Kimironko, Remera, Nyamirambo et plus. Consultez la carte sur notre page d'accueil. Livraison à domicile en 45 minutes !",
        "📍 Simba ifite **amashami 8 mu Kigali**: Kimironko, Remera, Nyamirambo n'ahandi. Reba ikarita ku rupapuro rwacu. Turatumiza ku rugo mu minota 45!"
      ),
    };
  }

  // Recipes
  if (/recip|cook|meal|dinner|lunch|breakfast|recette|cuisine|amafunguro|ifunguro|guteka/.test(q)) {
    const items = findProducts(['oil', 'tomato', 'rice', 'flour', 'spice', 'sauce', 'pasta', 'salt'], 4);
    return {
      role: 'assistant',
      text: pick(
        "👨‍🍳 For a classic Rwandan meal, try **Isombe with rice** or **Ugali with beans**. Here are some ingredients:",
        "👨‍🍳 Pour un repas rwandais, essayez l'**Isombe avec du riz** ou l'**Ugali avec des haricots**. Voici des ingrédients :",
        "👨‍🍳 Ku ifunguro rya kinyarwanda, gerageza **Isombe n'umuceri** cyangwa **Ugali n'ibishyimbo**. Dore ibikenewe:"
      ),
      products: items,
    };
  }

  // Bakery
  if (/bread|baguette|cake|croissant|bakery|pain|gâteau|boulangerie|umugati|ufu/.test(q)) {
    const items = findProducts(['baguette', 'bread', 'cake', 'croissant', 'bakery'], 4);
    return {
      role: 'assistant',
      text: pick(
        "🥐 Our bakery is baked **fresh every morning**! Baguettes, croissants, cakes and more:",
        "🥐 Notre boulangerie est cuite **fraîche chaque matin** ! Baguettes, croissants, gâteaux :",
        "🥐 Ubuvumbuzi bwacu buterwa **buri gitondo**! Baguette, croissant, imikate:"
      ),
      products: items,
    };
  }

  // Drinks/Party
  if (/drink|beer|wine|whisky|party|alcohol|boisson|bière|vin|ibiririwa|umunsi mukuru|celebrate/.test(q)) {
    const items = findProducts(['beer', 'wine', 'whisky', 'cognac', 'gin', 'vodka', 'champagne'], 4);
    return {
      role: 'assistant',
      text: pick(
        "🍷 Planning a celebration? Excellent selection of wines, beers, and spirits:",
        "🍷 Vous préparez une fête ? Excellente sélection de vins, bières et spiritueux :",
        "🍷 Witegura umunsi mukuru? Amahitamo meza y'inzoga:"
      ),
      products: items,
    };
  }

  // Baby
  if (/baby|infant|diaper|milk|formula|bébé|couche|umwana|inzoya/.test(q)) {
    const items = findProducts(['baby', 'diaper', 'milk', 'lactogen', 'wipes'], 4);
    return {
      role: 'assistant',
      text: pick(
        "👶 Everything for your little one — diapers, baby milk, wipes, toys:",
        "👶 Tout pour votre bébé — couches, lait, lingettes, jouets :",
        "👶 Byose ku mwana wawe — diapers, amata, wipes, ibikinisho:"
      ),
      products: items,
    };
  }

  // Cosmetics
  if (/shampoo|soap|lotion|cream|deodorant|cosmetic|beauty|savon|crème|isuku|ubwiza/.test(q)) {
    const items = findProducts(['shampoo', 'soap', 'lotion', 'cream', 'deodorant'], 4);
    return {
      role: 'assistant',
      text: pick(
        "✨ Wide range of personal care — shampoos, lotions, deodorants:",
        "✨ Large gamme de soins personnels — shampooings, lotions, déodorants :",
        "✨ Ibicuruzwa byo kwisukura — shampoo, lotion, deodorant:"
      ),
      products: items,
    };
  }

  // Cleaning
  if (/clean|detergent|mop|toilet|bleach|nettoyer|nettoyage|gusukura|isuku/.test(q)) {
    const items = findProducts(['clean', 'detergent', 'toilet', 'sponge', 'mop', 'bleach'], 4);
    return {
      role: 'assistant',
      text: pick(
        "🧹 Keep your home spotless! Full range of cleaning products:",
        "🧹 Gardez votre maison impeccable ! Gamme complète de produits ménagers :",
        "🧹 Fata inzu yawe isukuye! Ibicuruzwa byose byo gusukura:"
      ),
      products: items,
    };
  }

  // Electronics/Kitchen
  if (/electronic|kettle|blender|iron|fridge|kitchen|électronique|bouilloire|mixeur/.test(q)) {
    const items = findProducts(['kettle', 'blender', 'iron', 'pan', 'electric', 'coffee'], 4);
    return {
      role: 'assistant',
      text: pick(
        "⚡ Great range of kitchen appliances and electronics:",
        "⚡ Belle gamme d'appareils électroménagers :",
        "⚡ Ibikoresho bya kitchen na electronics:"
      ),
      products: items,
    };
  }

  // Sports
  if (/sport|gym|fitness|wellness|exercise|health|santé|ubuzima|imyitozo/.test(q)) {
    const items = findProducts(['sport', 'massage', 'roller', 'fitness'], 4);
    return {
      role: 'assistant',
      text: pick(
        "💪 Stay active! Sports and wellness products:",
        "💪 Restez actif ! Produits sport et bien-être :",
        "💪 Komeza gukora imyitozo! Ibicuruzwa bya sport:"
      ),
      products: items,
    };
  }

  // Product name search
  const nameMatch = findProducts([q], 4);
  if (nameMatch.length > 0) {
    return {
      role: 'assistant',
      text: pick(
        `Found ${nameMatch.length} result${nameMatch.length > 1 ? 's' : ''} for "${input}":`,
        `${nameMatch.length} résultat${nameMatch.length > 1 ? 's' : ''} pour "${input}" :`,
        `Ibisubizo ${nameMatch.length} bya "${input}":`
      ),
      products: nameMatch,
    };
  }

  // About Simba
  if (/simba|about|ibyerekeye|à propos|who|what is/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "🦁 Simba Supermarket is Rwanda's most trusted supermarket chain, founded by Mr. Teklay Teame. We have 8 branches across Kigali, 700+ products, and deliver in 45 minutes. Shop at simbaonlineshopping.com!",
        "🦁 Simba Supermarket est la chaîne la plus fiable du Rwanda, fondée par M. Teklay Teame. 8 agences à Kigali, 700+ produits, livraison en 45 minutes. Achetez sur simbaonlineshopping.com !",
        "🦁 Simba ni isoko nziza cyane mu Rwanda, yashinzwe na Bwana Teklay Teame. Amashami 8 mu Kigali, ibicuruzwa 700+, gutumiza mu minota 45. Gura kuri simbaonlineshopping.com!"
      ),
    };
  }

  // Default fallback
  return {
    role: 'assistant',
    text: pick(
      "I'm here to help! You can ask me about:\n• 🛒 Finding products\n• 🚴 Delivery (45 min)\n• 💳 Payment (MoMo)\n• 🎁 Promo codes\n• 👨‍🍳 Recipe ideas\n• 📍 Store locations\n\nWhat would you like to know?",
      "Je suis là pour vous aider ! Demandez-moi :\n• 🛒 Trouver des produits\n• 🚴 Livraison (45 min)\n• 💳 Paiement (MoMo)\n• 🎁 Codes promo\n• 👨‍🍳 Recettes\n• 📍 Emplacements\n\nQue voulez-vous savoir ?",
      "Ndi hano kukufasha! Mbaza:\n• 🛒 Gushaka ibicuruzwa\n• 🚴 Gutumiza (min 45)\n• 💳 Kwishura (MoMo)\n• 🎁 Amakode ya promo\n• 👨‍🍳 Amafunguro\n• 📍 Aho amashami ari\n\nUshaka kumenya iki?"
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function SimbaPulse() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { language, addToCart } = useSimbaStore();
  const t = translations[language];
  const allProducts = getSimbaData().products;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat([{ role: 'assistant', text: t.aiGreeting }]);
  }, [language, t.aiGreeting]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, isTyping]);

  const handleSend = async (msg?: string) => {
    const text = (msg || message).trim();
    if (!text || isTyping) return;

    setChat(prev => [...prev, { role: 'user', text }]);
    setMessage('');
    setIsTyping(true);

    try {
      // Try real Gemini API first
      const history = chat
        .filter((_, i) => i > 0 || chat[0].role === 'user')
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      history.push({ role: 'user', content: text });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message && !data.message.startsWith('AI service not configured') && !data.message.startsWith('AI Error')) {
          setIsTyping(false);
          setChat(prev => [...prev, { role: 'assistant', text: data.message }]);
          return;
        }
      }
    } catch {
      // API unavailable — fall through to local engine
    }

    // Local engine fallback
    const delay = 400 + Math.random() * 400;
    setTimeout(() => {
      setIsTyping(false);
      setChat(prev => [...prev, buildResponse(text, language, allProducts)]);
    }, delay);
  };

  const quickPrompts = [t.aiQuickRecipe, t.aiQuickBaby, t.aiQuickDrinks, t.aiQuickHealthy];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-[60] w-14 h-14 bg-brand-dark rounded-2xl shadow-xl flex items-center justify-center border-2 border-brand/40"
        aria-label="Open Simba AI"
      >
        <Sparkles className="w-6 h-6 text-brand" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[65] sm:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] z-[70] h-[560px] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-brand-dark flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-white">Simba Pulse</p>
                    <p className="text-[10px] text-white/60 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      AI Assistant · Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Chat */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900" style={{ scrollbarWidth: 'none' }}>
                {chat.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[88%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-brand text-gray-900 font-bold rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>

                    {msg.products && msg.products.length > 0 && (
                      <div className="flex gap-2 mt-2 overflow-x-auto pb-1 w-full" style={{ scrollbarWidth: 'none' }}>
                        {msg.products.map(p => (
                          <div key={p.id} className="min-w-[110px] bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2 shadow-sm flex-shrink-0">
                            <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 bg-gray-50">
                              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="110px" />
                            </div>
                            <p className="text-[10px] font-bold truncate text-gray-900 dark:text-white">{p.name}</p>
                            <p className="text-[10px] font-black text-brand mt-0.5">{p.price.toLocaleString()} RWF</p>
                            <button
                              onClick={() => addToCart(p)}
                              className="mt-1.5 w-full py-1 bg-brand-dark text-white rounded-lg text-[9px] font-black uppercase tracking-wide hover:bg-brand hover:text-gray-900 transition-colors"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 shadow-sm">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick prompts */}
              {chat.length <= 1 && (
                <div className="px-4 py-2 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
                  {quickPrompts.map(p => (
                    <button key={p} onClick={() => handleSend(p)}
                      className="flex-shrink-0 px-3 py-1.5 bg-brand/10 text-gray-800 dark:text-brand rounded-full text-xs font-bold hover:bg-brand hover:text-gray-900 transition-colors border border-brand/20 whitespace-nowrap">
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* WhatsApp */}
              <div className="px-4 py-2 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
                <a href="https://wa.me/250788000000" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#22c55e] transition-colors">
                  <Phone className="w-3 h-3" /> {t.aiWhatsapp}
                </a>
              </div>

              {/* Input */}
              <div className="p-3 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex gap-2 flex-shrink-0">
                <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend()}
                  placeholder={t.aiInputPlaceholder} disabled={isTyping}
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors text-gray-900 dark:text-white placeholder:text-gray-400 disabled:opacity-50" />
                <button onClick={() => handleSend()} disabled={!message.trim() || isTyping}
                  className="w-10 h-10 bg-brand-dark disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 rounded-xl flex items-center justify-center hover:bg-brand hover:text-gray-900 transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
