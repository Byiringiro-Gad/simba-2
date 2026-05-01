'use client';

import Link from 'next/link';
import { useSimbaStore } from '@/store/useSimbaStore';
import { ShoppingBag, Store, ShieldCheck, ArrowLeft } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function LoginPage() {
  const { language, setAuthOpen } = useSimbaStore();
  const isFr = language === 'fr';
  const isRw = language === 'rw';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {isFr ? 'Retour au magasin' : isRw ? 'Subira ku isoko' : 'Back to Store'}
      </Link>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 relative bg-brand-dark">
            <img src="/simbaheaderM.png" alt="Simba" style={{position:'absolute',height:'100%',width:'auto',maxWidth:'none',left:0,top:0}} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
            {isFr ? 'Connexion' : isRw ? 'Injira' : 'Sign In'}
          </h1>
          <p className="text-sm text-gray-400">
            {isFr ? 'Choisissez votre type de compte' : isRw ? 'Hitamo ubwoko bwa konti yawe' : 'Choose your account type'}
          </p>
        </div>
        <div className="space-y-3">
          <button onClick={() => setAuthOpen(true)} className="w-full flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-brand hover:shadow-md transition-all text-left">
            <div className="w-12 h-12 bg-brand-muted rounded-2xl flex items-center justify-center flex-shrink-0"><ShoppingBag className="w-6 h-6 text-brand" /></div>
            <div>
              <p className="font-black text-gray-900 dark:text-white">{isFr ? 'Client / Acheteur' : isRw ? 'Umukiriya' : 'Customer / Buyer'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isFr ? 'Parcourir, commander et suivre vos achats' : isRw ? 'Kureba, gutumiza no gukurikirana ibicuruzwa' : 'Browse, order and track your purchases'}</p>
            </div>
          </button>
          <Link href="/staff" className="w-full flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-brand hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0"><Store className="w-6 h-6 text-green-600" /></div>
            <div>
              <p className="font-black text-gray-900 dark:text-white">{isFr ? "Personnel de l'agence" : isRw ? "Abakozi b'ishami" : 'Branch Staff / Manager'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isFr ? "Gérer les commandes et l'inventaire" : isRw ? "Gucunga itumiziwa n'ububiko" : 'Manage branch orders and inventory'}</p>
            </div>
          </Link>
          <Link href="/admin/login" className="w-full flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-brand hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-6 h-6 text-red-500" /></div>
            <div>
              <p className="font-black text-gray-900 dark:text-white">{isFr ? 'Administrateur HQ' : isRw ? 'Umuyobozi Mukuru' : 'Admin / HQ'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isFr ? 'Accès complet à toutes les agences et données' : isRw ? 'Uburenganzira bwose ku mashami yose' : 'Full access to all branches and data'}</p>
            </div>
          </Link>
        </div>
      </div>
      <AuthModal />
    </div>
  );
}