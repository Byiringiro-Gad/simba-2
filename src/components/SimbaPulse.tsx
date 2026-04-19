'use client';

import { useState, useEffect, useRef } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { translations } from '@/lib/translations';
import { getSimbaData } from '@/lib/data';
import { Sparkles, MessageSquare, X, Send, Utensils, Zap, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SimbaPulse() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string; products?: any[] }[]>([
    { role: 'ai', text: "Muraho! I'm Pulse, your Simba AI. I can help you find products or plan a meal. What's on your mind?" }
  ]);
  const { language } = useSimbaStore();
  const products = getSimbaData().products;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMsg = message.toLowerCase();
    setChat(prev => [...prev, { role: 'user', text: message }]);
    setMessage('');

    // Simulated "Smart" AI Logic based on local dataset
    setTimeout(() => {
      let aiResponse = "I'm not sure about that, but you can find amazing fresh produce in our supermarket section!";
      let suggestedProducts: any[] = [];

      if (userMsg.includes('recipe') || userMsg.includes('cook') || userMsg.includes('meal')) {
        aiResponse = "Great idea! For a classic Rwandan meal, I recommend fresh Tilapia with Isombe. Here is what you'll need:";
        suggestedProducts = products.filter(p => 
          p.name.toLowerCase().includes('fish') || 
          p.name.toLowerCase().includes('oil') || 
          p.category.includes('Groceries')
        ).slice(0, 3);
      } else if (userMsg.includes('drink') || userMsg.includes('party')) {
        aiResponse = "Planning a celebration? We have a premium selection of spirits and beverages:";
        suggestedProducts = products.filter(p => p.category.includes('Alcoholic')).slice(0, 3);
      } else if (userMsg.includes('baby')) {
        aiResponse = "We have everything for your little one. Check out these top picks:";
        suggestedProducts = products.filter(p => p.category.includes('Baby')).slice(0, 3);
      }

      setChat(prev => [...prev, { role: 'ai', text: aiResponse, products: suggestedProducts }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[60] w-16 h-16 bg-gradient-to-tr from-simba-primary to-simba-gold rounded-2xl shadow-2xl flex items-center justify-center text-white border-2 border-white/20 backdrop-blur-md"
      >
        <Sparkles className="w-8 h-8 animate-pulse" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[70] w-[380px] h-[600px] bg-white dark:bg-simba-dark rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-simba-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Simba Pulse</h3>
                  <p className="text-[10px] font-bold opacity-70">AI Concierge • Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {chat.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${
                    msg.role === 'user' 
                    ? 'bg-simba-primary text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {msg.products && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 w-full no-scrollbar">
                      {msg.products.map(p => (
                        <div key={p.id} className="min-w-[120px] bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700 p-2 shadow-sm">
                          <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                            <Image src={p.image} alt={p.name} fill className="object-cover" />
                          </div>
                          <p className="text-[10px] font-bold truncate">{p.name}</p>
                          <p className="text-[10px] text-simba-primary font-black">{p.price} RWF</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Support Bridge */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2">
                <a 
                    href="https://wa.me/250780000000" 
                    target="_blank"
                    className="flex-1 py-3 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    <Phone className="w-3 h-3" /> WhatsApp Support
                </a>
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-simba-dark border-t dark:border-gray-800 flex gap-2">
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about recipes, products..." 
                className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-simba-primary outline-none transition-all"
              />
              <button 
                onClick={handleSend}
                className="w-12 h-12 bg-simba-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
