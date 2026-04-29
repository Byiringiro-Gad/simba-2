'use client';

import { useEffect } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { useRouter } from 'next/navigation';

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
        <p className="text-white font-black text-xl mb-2">🇷🇼 Simba Supermarket</p>
        <p className="text-white/60 text-sm">Guhindura ururimi mu Kinyarwanda...</p>
        <div className="flex gap-1.5 justify-center mt-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-brand rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
