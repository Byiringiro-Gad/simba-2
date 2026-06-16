'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
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
        "Hello! I'm Pulse, the Simba Supermarket AI assistant. I can help you find products, suggest meal ideas, and answer questions about our branches, payment options, and more. How can I help you today?",
        "Bonjour ! Je suis Pulse, l'assistant IA de Simba Supermarket. Je peux vous aider à trouver des produits, suggérer des recettes et répondre à vos questions sur nos agences, les paiements et plus encore. Comment puis-je vous aider ?",
        "Muraho! Ndi Pulse, umufasha wa AI wa Simba Supermarket. Nshobora kukufasha gushaka ibicuruzwa, gutanga ingero z'amafunguro, gusubiza ibibazo ku mashami, kwishura n'ibindi. Nakufasha iki?"
      ),
    };
  }

  // Pickup / time
  if (/deliver|pickup|pick.?up|livr|gutumiz|time|igihe|fast|vuba|how long|combien|minutes|minota|ready/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "Simba Online Shopping is a pickup service. Once you place an order, your basket is prepared by branch staff and ready for collection in 20–45 minutes. We have 9 branches across Kigali — choose the one closest to you. There is no home delivery at this time.",
        "Simba Online Shopping est un service de retrait. Une fois votre commande passée, votre panier est préparé par l'équipe de l'agence et prêt à retirer en 20–45 minutes. Nous avons 9 agences à Kigali. La livraison à domicile n'est pas disponible pour l'instant.",
        "Simba Online Shopping niyo serivisi yo gufata ibicuruzwa. Nyuma yo gutumiza, igitebo cyawe gitegurwa n'abakozi b'ishami kandi kiba giteganijwe mu minota 20–45. Dufite amashami 9 i Kigali. Nta gutumizwa mu rugo biraboneka ubu."
      ),
    };
  }

  // Payment
  if (/pay|momo|mobile money|airtel|mtn|kwishur|payer|payment|checkout|deposit|inguzanyo/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "Simba accepts MTN Mobile Money, Airtel Money, and card payments. A 500 RWF deposit is required at checkout to confirm your order. The remaining balance is paid at the branch when you collect. The deposit helps ensure your basket is prepared only for confirmed orders.",
        "Simba accepte MTN Mobile Money, Airtel Money et le paiement par carte. Un dépôt de 500 RWF est requis à la caisse pour confirmer votre commande. Le solde restant est payé à l'agence lors du retrait.",
        "Simba yemera MTN Mobile Money, Airtel Money na ikarita. Inguzanyo ya 500 RWF irasabwa mu kwishura kugira ngo wemeze itumizwa. Isigaye wishurwa mu ishami igihe ugiye gufata ibicuruzwa byawe."
      ),
    };
  }

  // Promo codes
  if (/promo|discount|code|coupon|offer|offre|igabanywa|kode|sale/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "Simba runs promo codes from time to time. Check the cart section — if any active codes are available, you can enter them before checkout to get a discount on your order.",
        "Simba propose des codes promo de temps en temps. Vérifiez la section panier — si des codes actifs sont disponibles, vous pouvez les saisir avant le paiement pour obtenir une réduction.",
        "Simba itanga amakode ya promo rimwe na rimwe. Reba igice cy'agosho — niba amakode akora ariho, ushobora ayashyira mbere yo kwishura kugira ngo ubone igabanywa."
      ),
    };
  }

  // Loyalty
  if (/point|loyalt|fidél|ubudahemuka|reward|earn/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "Simba's loyalty programme awards 1 point for every 100 RWF spent. You need 200 points to reach Silver tier and 500 points for Gold. Your points are tracked automatically in your account under the Loyalty Wallet section.",
        "Le programme de fidélité Simba accorde 1 point pour 100 RWF dépensés. Vous avez besoin de 200 points pour le niveau Argent et 500 pour Or. Vos points sont suivis automatiquement dans votre compte.",
        "Porogaramu y'ubudahemuka ya Simba iha amanota 1 kuri RWF 100 wishurwa. Ukeneye amanota 200 kugera ku rwego rwa Ifeza no 500 kugera ku Zahabu. Amanota yawe akurikiriranwa mu konti yawe."
      ),
    };
  }

  // Branches / locations
  if (/locat|branch|where|kigali|aho|agence|kimironko|nyamirambo|remera|store|ishami/.test(q)) {
    return {
      role: 'assistant',
      text: pick(
        "Simba Supermarket has 9 branches across Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, and Nyanza. All branches are open Monday to Saturday 8:00 AM–9:00 PM, and Sunday 9:00 AM–6:00 PM (Nyanza closes at 8:00 PM).",
        "Simba Supermarket a 9 agences à Kigali : Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga et Nyanza. Toutes les agences sont ouvertes du lundi au samedi de 8h à 21h, et le dimanche de 9h à 18h.",
        "Simba Supermarket ifite amashami 9 i Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, na Nyanza. Amashami yose afungura kuva Kuwa mbere kugeza Kuwa gatandatu saa mbiri kugeza saa tatu nijoro, no ku cyumweru saa tatu kugeza saa kumi nijoro."
      ),
    };
  }

  // Recipes
  if (/recip|cook|meal|dinner|lunch|breakfast|recette|cuisine|amafunguro|ifunguro|guteka/.test(q)) {
    const items = findProducts(['oil', 'tomato', 'rice', 'flour', 'spice', 'sauce', 'pasta', 'salt'], 4);
    return {
      role: 'assistant',
      text: pick(
        "For a classic Rwandan meal, consider Isombe with rice, Ugali with beans, or Akabenz chicken. Here are some ingredients available at Simba:",
        "Pour un repas rwandais classique, pensez à l'Isombe avec du riz, l'Ugali aux haricots ou le poulet Akabenz. Voici quelques ingrédients disponibles chez Simba :",
        "Ku ifunguro rya kinyarwanda, gerageza Isombe n'umuceri, Ugali n'ibishyimbo, cyangwa inkoko ya Akabenz. Dore ibikenewe bibonetse kuri Simba:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Bakery
  if (/bread|baguette|cake|croissant|bakery|pain|gâteau|boulangerie|umugati|ufu/.test(q)) {
    const items = findProducts(['baguette', 'bread', 'cake', 'croissant', 'bakery'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Yes, Simba has a bakery section with freshly baked items including baguettes, bread, croissants, and cakes. Here is what we currently carry:",
        "Oui, Simba a une section boulangerie avec des produits frais : baguettes, pain, croissants et gâteaux. Voici ce que nous proposons actuellement :",
        "Yego, Simba ifite igice cy'ufu gifite imikate mishya harimo baguette, umugati, croissants na keiki. Dore ibiriho ubu:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Drinks / beverages
  if (/drink|beer|wine|whisky|party|alcohol|boisson|bière|vin|ibiririwa|umunsi mukuru|celebrate/.test(q)) {
    const items = findProducts(['beer', 'wine', 'whisky', 'cognac', 'gin', 'vodka', 'champagne'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Simba carries a wide range of beverages including wines, beers, and spirits. Please note that alcoholic beverages require valid ID proof of age at pickup. Here are some options:",
        "Simba propose une large gamme de boissons, notamment des vins, bières et spiritueux. Veuillez noter qu'une pièce d'identité est requise pour les boissons alcoolisées au retrait. Voici quelques options :",
        "Simba ifite inzoga nyinshi harimo divaini, inzoga z'inzabibu, na spirits. Menya ko ikarita y'indangamuntu irasabwa igihe ugiye gufata inzoga z'umutuzo. Dore amahitamo:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Baby
  if (/baby|infant|diaper|formula|bébé|couche|umwana|inzoya/.test(q)) {
    const items = findProducts(['baby', 'diaper', 'lactogen', 'wipes'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Simba has a dedicated baby products section with diapers, baby formula, wipes, and more. Here is what is currently available:",
        "Simba dispose d'une section produits bébé avec des couches, du lait infantile, des lingettes et plus encore. Voici ce qui est disponible :",
        "Simba ifite igice cy'ibicuruzwa by'umwana gifite pampers, amata y'umwana, udushwemo n'ibindi. Dore ibiriho ubu:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Cosmetics
  if (/shampoo|soap|lotion|cream|deodorant|cosmetic|beauty|savon|crème|isuku|ubwiza/.test(q)) {
    const items = findProducts(['shampoo', 'soap', 'lotion', 'cream', 'deodorant'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Yes, Simba has a cosmetics and personal care section. Here is a selection currently in stock:",
        "Oui, Simba a une section cosmétiques et soins personnels. Voici une sélection actuellement en stock :",
        "Yego, Simba ifite igice cy'ibicuruzwa byo kwiyitaho. Dore amahitamo ariho ubu:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Cleaning
  if (/clean|detergent|mop|toilet|bleach|nettoyer|nettoyage|gusukura/.test(q)) {
    const items = findProducts(['clean', 'detergent', 'toilet', 'sponge', 'mop', 'bleach'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Simba stocks a full range of cleaning and household products. Here is what is available:",
        "Simba propose une gamme complète de produits ménagers et de nettoyage. Voici ce qui est disponible :",
        "Simba ifite imirimo yose yo gusukura ndetse n'ibikoresho by'urugo. Dore ibiriho:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Electronics / kitchen
  if (/electronic|kettle|blender|iron|kitchen|électronique|bouilloire|mixeur/.test(q)) {
    const items = findProducts(['kettle', 'blender', 'iron', 'pan', 'electric', 'coffee'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Simba carries kitchen appliances and electronics. Here is what we currently have in stock:",
        "Simba propose des appareils de cuisine et de l'électronique. Voici ce que nous avons actuellement en stock :",
        "Simba ifite ibikoresho bya kicheni na electronique. Dore ibiriho ubu:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Sports
  if (/sport|gym|fitness|wellness|exercise|health|santé|ubuzima|imyitozo/.test(q)) {
    const items = findProducts(['sport', 'massage', 'roller', 'fitness'], 4);
    return {
      role: 'assistant',
      text: pick(
        "Simba has a sports and wellness section. Here are some products available:",
        "Simba a une section sport et bien-être. Voici quelques produits disponibles :",
        "Simba ifite igice cy'imikino na ubuzima. Dore amahitamo:"
      ),
      products: items.length > 0 ? items : undefined,
    };
  }

  // Direct product name search
  const nameMatch = findProducts([q], 4);
  if (nameMatch.length > 0) {
    return {
      role: 'assistant',
      text: pick(
        `Found ${nameMatch.length} result${nameMatch.length > 1 ? 's' : ''} matching "${input}":`,
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
        "Simba Supermarket Ltd is one of Rwanda's leading supermarket chains, led by Teklay Teame. With 9 branches across Kigali, Simba offers 700+ products spanning groceries, bakery, cosmetics, electronics, baby products, beverages, and more. You can order online and pick up at your nearest branch in 20–45 minutes.",
        "Simba Supermarket Ltd est l'une des principales chaînes de supermarchés du Rwanda, dirigée par Teklay Teame. Avec 9 agences à Kigali, Simba propose 700+ produits couvrant l'épicerie, la boulangerie, les cosmétiques, l'électronique, les produits bébé, les boissons et plus encore.",
        "Simba Supermarket Ltd ni kimwe mu bisoko nkuru bikomeye mu Rwanda, cyayoborwa na Teklay Teame. Bifite amashami 9 i Kigali kandi biha ibicuruzwa 700+ harimo ibiribwa, ufu, ibicuruzwa byo kwiyitaho, ikoranabuhanga, ibicuruzwa by'umwana, ibiririwa n'ibindi."
      ),
    };
  }

  // Default fallback
  return {
    role: 'assistant',
    text: pick(
      "I can help you with:\n\n- Finding specific products\n- Branch locations and hours\n- Payment methods and deposit\n- Pickup times and process\n- Loyalty points\n- Promo codes\n- Meal and recipe ideas\n\nWhat would you like to know?",
      "Je peux vous aider avec :\n\n- Trouver des produits spécifiques\n- Emplacements et horaires des agences\n- Modes de paiement et dépôt\n- Horaires et processus de retrait\n- Points de fidélité\n- Codes promo\n- Idées de repas et recettes\n\nQue souhaitez-vous savoir ?",
      "Nshobora kukufasha:\n\n- Gushaka ibicuruzwa runaka\n- Aho amashami ari n'amasaha\n- Uburyo bwo kwishura n'inguzanyo\n- Igihe cyo gufata n'uburyo\n- Amanota y'ubudahemuka\n- Amakode ya promo\n- Ingero z'amafunguro\n\nUshaka kumenya iki?"
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
  const pathname = usePathname();
  const t = translations[language];
  const allProducts = getSimbaData().products;
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide on staff-facing pages
  const isStaffPage = pathname.startsWith('/admin') || pathname.startsWith('/branch') || pathname.startsWith('/staff');
  if (isStaffPage) return null;

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
      // Build message history for Groq
      const history = [
        ...chat.map(m => ({ role: m.role, content: m.text })),
        { role: 'user', content: text },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message && data.message !== '__NO_API_KEY__') {
          setIsTyping(false);
          // Resolve product IDs to full product objects
          const products = data.productIds?.length
            ? allProducts.filter((p: Product) => data.productIds.includes(p.id))
            : undefined;
          setChat(prev => [...prev, { role: 'assistant', text: data.message, products }]);
          return;
        }
      }
    } catch {
      // Network error — fall through to local engine
    }

    // Local engine fallback (works without any API key)
    const delay = 400 + Math.random() * 300;
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
        className="fixed bottom-32 sm:bottom-6 left-4 z-[57] w-14 h-14 bg-brand-dark rounded-2xl shadow-xl flex items-center justify-center border-2 border-brand/40"
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
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px] z-[70] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
              style={{ height: 'min(560px, calc(100dvh - 2rem))' }}
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
                <a href="https://wa.me/250788386386" target="_blank" rel="noopener noreferrer"
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
