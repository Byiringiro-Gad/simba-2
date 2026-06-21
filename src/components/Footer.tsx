'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSimbaStore } from '@/store/useSimbaStore';
import { MapPin, Phone, Mail } from 'lucide-react';
import { SIMBA_BRANCHES } from '@/lib/branches';

export default function Footer() {
  const { language } = useSimbaStore();

  const copy = {
    en: {
      about: 'About Simba',
      founded: 'Founded 2007 - Kigali, Rwanda',
      desc: 'Rwanda trusted supermarket with 700+ products across 9 Kigali branches.',
      shop: 'Shop',
      company: 'Company',
      legal: 'Legal',
      support: 'Support',
      hours: 'Store Hours',
      payment: 'We Accept',
      branches: `${SIMBA_BRANCHES.length} Branches in Kigali`,
      followUs: 'Follow us',
      copyright: `© ${new Date().getFullYear()} Simba Supermarket Ltd - Kigali, Rwanda - All rights reserved.`,
      monSat: 'Mon-Sat: 8:00 AM - 9:00 PM',
      sunday: 'Sunday: 9:00 AM - 6:00 PM',
    },
    fr: {
      about: 'A propos de Simba',
      founded: 'Fondee en 2007 - Kigali, Rwanda',
      desc: 'Supermarche de confiance au Rwanda avec 700+ produits dans 9 agences a Kigali.',
      shop: 'Boutique',
      company: 'Entreprise',
      legal: 'Legal',
      support: 'Assistance',
      hours: 'Heures',
      payment: 'Paiements',
      branches: `${SIMBA_BRANCHES.length} agences a Kigali`,
      followUs: 'Suivez-nous',
      copyright: `© ${new Date().getFullYear()} Simba Supermarket Ltd - Kigali, Rwanda - Tous droits reserves.`,
      monSat: 'Lun-Sam: 8h-21h',
      sunday: 'Dimanche: 9h-18h',
    },
    rw: {
      about: 'Ibyerekeye Simba',
      founded: 'Yashinzwe 2007 - Kigali, Rwanda',
      desc: 'Supermarket yizewe mu Rwanda ifite ibicuruzwa 700+ mu mashami 9 i Kigali.',
      shop: 'Isoko',
      company: 'Sosiyete',
      legal: 'Amategeko',
      support: 'Ubufasha',
      hours: 'Amasaha',
      payment: 'Kwishyura',
      branches: `Amashami ${SIMBA_BRANCHES.length} i Kigali`,
      followUs: 'Dukurikire',
      copyright: `© ${new Date().getFullYear()} Simba Supermarket Ltd - Kigali, Rwanda - Uburenganzira bwose bwibitswe.`,
      monSat: 'Kuwa Mbere-Kuwa Gatandatu: 8:00 - 21:00',
      sunday: 'Ku Cyumweru: 9:00 - 18:00',
    },
  } as const;

  const t = copy[language];

  const COMPANY_LINKS: { href: string; label: { en: string; fr: string; rw: string }; external?: boolean }[] = [
    { href: '/about',   label: { en: 'About Us',      fr: 'A propos de nous',      rw: 'Ibyerekeye twe' } },
    { href: '/faq',     label: { en: 'FAQ',            fr: 'FAQ',                   rw: 'Ibibazo' } },
    { href: '/contact', label: { en: 'Contact',        fr: 'Contact',               rw: 'Twandikire' } },
  ];

  const LEGAL_LINKS = [
    { href: '/terms', label: { en: 'Terms of Service', fr: "Conditions d'utilisation", rw: "Amategeko y'ikoreshwa" } },
    { href: '/privacy', label: { en: 'Privacy Policy', fr: 'Politique de confidentialite', rw: "Politiki y'ibanga" } },
  ];

  const SUPPORT_LINKS = [
    { href: 'https://wa.me/250788386386', label: { en: 'WhatsApp Support', fr: 'Support WhatsApp', rw: 'Ubufasha bwa WhatsApp' }, external: true },
    { href: 'tel:+250788386386', label: { en: 'Call Us', fr: 'Appelez-nous', rw: 'Duhamagare' }, external: true },
    { href: 'mailto:info@simbaonlineshopping.com', label: { en: 'Email Us', fr: 'Ecrivez-nous', rw: 'Twandikire kuri email' }, external: true },
  ];

  const linkClass = 'text-xs font-medium text-gray-500 transition-colors hover:text-brand-dark dark:text-gray-400 dark:hover:text-brand';

  return (
    <footer className="mt-8 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto max-w-screen-xl px-4 pb-6 pt-10 sm:px-6">
        <div className="mb-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="mb-4 inline-flex items-center gap-2.5 rounded-xl px-3 py-2" style={{ backgroundColor: '#FF6600' }}>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image src="/simba-icon.png" alt="Simba" width={28} height={28} className="object-contain" />
              </div>
              <div>
                <p className="text-sm font-black leading-none text-white">Simba Supermarket</p>
                <p className="mt-0.5 text-[10px] text-white/70">Online Shopping</p>
              </div>
            </div>
            <p className="mb-3 max-w-xs text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t.desc}</p>
            <p className="mb-4 text-[10px] text-gray-400">{t.founded}</p>

            <div className="space-y-2">
              <a
                href="https://maps.google.com/?q=Simba+Centenary+KN+4+Ave+Kigali"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-xs text-gray-500 transition-colors hover:text-brand-dark dark:text-gray-400"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <span>Simba Centenary, KN 4 Ave, Kigali, Rwanda</span>
              </a>
              <a href="tel:+250788386386" className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-brand-dark dark:text-gray-400">
                <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                +250 788 386 386
              </a>
              <a href="mailto:info@simbaonlineshopping.com" className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-brand-dark dark:text-gray-400">
                <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                info@simbaonlineshopping.com
              </a>
            </div>

            
          </div>


          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t.company}</p>
            <div className="space-y-2">
              {COMPANY_LINKS.map((l) =>
                l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`block ${linkClass}`}>
                    {l.label[language as 'en' | 'fr' | 'rw'] ?? l.label.en}
                  </a>
                ) : (
                  <Link key={l.href} href={l.href} className={`block ${linkClass}`}>
                    {l.label[language as 'en' | 'fr' | 'rw'] ?? l.label.en}
                  </Link>
                )
              )}
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t.hours}</p>
            <div className="mb-5 space-y-1.5">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.monSat}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.sunday}</p>
              <p className="text-xs italic text-gray-400">
                {language === 'fr' ? 'Nyanza: 8h-20h' : language === 'rw' ? 'Nyanza: 8h-20h' : 'Nyanza branch: 8am-8pm'}
              </p>
            </div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{t.payment}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-yellow-400 px-2 py-1 text-[9px] font-black text-black">MTN MoMo</span>
              <span className="rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black text-white">Airtel Money</span>
              <span className="rounded-lg bg-slate-800 px-2 py-1 text-[9px] font-black text-white">Card</span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400">{t.support}</p>
            <div className="mb-5 space-y-2">
              {SUPPORT_LINKS.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={`block ${linkClass}`}>
                  {l.label[language as 'en' | 'fr' | 'rw'] ?? l.label.en}
                </a>
              ))}
            </div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">{t.legal}</p>
            <div className="space-y-2">
              {LEGAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={`block ${linkClass}`}>
                  {l.label[language as 'en' | 'fr' | 'rw'] ?? l.label.en}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row dark:border-gray-800">
          <p className="text-center text-[10px] text-gray-400 sm:text-left">{t.copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-[10px] text-gray-400 transition-colors hover:text-brand-dark dark:hover:text-brand">
              {language === 'fr' ? 'Conditions' : language === 'rw' ? 'Amategeko' : 'Terms'}
            </Link>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <Link href="/privacy" className="text-[10px] text-gray-400 transition-colors hover:text-brand-dark dark:hover:text-brand">
              {language === 'fr' ? 'Confidentialite' : language === 'rw' ? 'Ibanga' : 'Privacy'}
            </Link>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <Link href="/about" className="text-[10px] text-gray-400 transition-colors hover:text-brand-dark dark:hover:text-brand">
              {language === 'fr' ? 'A propos' : language === 'rw' ? 'Ibyerekeye' : 'About'}
            </Link>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <Link href="/deals" className="text-[10px] text-gray-400 transition-colors hover:text-brand-dark dark:hover:text-brand font-black">
              {language === 'fr' ? '🏷️ Offres' : language === 'rw' ? '🏷️ Ibiciro' : '🏷️ Deals'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
