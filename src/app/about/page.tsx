import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Clock, Phone, Mail, ShoppingBag, Users, Package, Store } from 'lucide-react';
import { SIMBA_BRANCHES } from '@/lib/branches';

export const metadata: Metadata = {
  title: 'About Simba Supermarket | Kigali, Rwanda',
  description: 'About Simba Supermarket Ltd — one of Rwanda\'s leading grocery retailers, serving Kigali with 9 branches and 700+ products.',
};

export default function AboutPage() {
  const stats = [
    { icon: ShoppingBag,  value: '700+',                   label: 'Products' },
    { icon: Store,        value: `${SIMBA_BRANCHES.length}`, label: 'Branches in Kigali' },
    { icon: Users,        value: '250–499',                 label: 'Employees' },
    { icon: Package,      value: '20–45',                   label: 'Min pickup time' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header bar */}
      <div className="bg-[#FF6600] px-4 sm:px-6 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to store
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image src="/simba-icon.png" alt="Simba" width={28} height={28} className="object-contain" />
            </div>
            <span className="font-black text-white text-sm hidden sm:block">Simba Supermarket</span>
          </Link>
        </div>
      </div>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-12 pb-20">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-[#FF6600] flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden">
            <Image src="/simba-icon.png" alt="Simba" width={60} height={60} className="object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-3">
            Simba Supermarket
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            One of Rwanda's leading supermarket retailers, serving Kigali residents with quality everyday products across 9 branches.
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-center">
              <Icon className="w-5 h-5 text-brand mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">About the Company</h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Simba Supermarket Ltd is a grocery retail company headquartered in Kigali, Rwanda, operating under the leadership of Teklay Teame. The company employs between 250 and 499 staff across its network of branches.
              </p>
              <p>
                With a product catalogue spanning 700+ items — including groceries, bakery, cosmetics and personal care, baby products, kitchenware, electronics, sports and wellness, alcoholic beverages, cleaning and sanitary products, kitchen storage, and pet care — Simba aims to provide everything a Kigali household needs under one roof.
              </p>
              <p>
                The online shopping platform allows customers to browse the full catalogue, place orders in advance, and collect their basket ready-prepared at their nearest branch in 20–45 minutes. A small 500 RWF deposit is required at checkout via MTN Mobile Money, Airtel Money, or card. The remaining balance is settled at the branch on collection.
              </p>
              <p className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                Company information sourced from: Dun &amp; Bradstreet, Datanyze, ZoomInfo. The official Simba website is{' '}
                <a href="https://www.simbaonlineshopping.com" target="_blank" rel="noopener noreferrer" className="text-brand-dark hover:underline">simbaonlineshopping.com</a>.
              </p>
            </div>
          </div>
          <div className="relative h-64 lg:h-auto rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src="/store-images/store-3.jpg"
              alt="Simba Supermarket Kigali"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <p className="absolute bottom-4 left-4 text-white text-xs font-bold">Kigali, Rwanda</p>
          </div>
        </div>

        {/* How pickup works */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-12">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">How Online Pickup Works</h2>
          <p className="text-sm text-gray-400 mb-6">Order online — collect in person. No home delivery at this time.</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { n: '01', title: 'Browse & Add',    desc: 'Find what you need from 700+ products across all categories.' },
              { n: '02', title: 'Choose Branch',   desc: 'Pick any of 9 Simba branches in Kigali as your collection point.' },
              { n: '03', title: 'Pay 500 RWF',     desc: 'Pay a small deposit via MTN MoMo, Airtel Money, or card to confirm.' },
              { n: '04', title: 'Collect in 20–45 min', desc: 'Staff prepare your order. Collect and pay the balance at the branch.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center mb-3 text-white font-black text-sm">{n}</div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Video section — Kigali shopping context */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-12 overflow-hidden">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Simba in Kigali</h2>
          <p className="text-sm text-gray-400 mb-5">See what grocery shopping looks like in Kigali, Rwanda.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* YouTube search embed for Simba Supermarket Kigali */}
            <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
              <iframe
                src="https://www.youtube.com/embed?listType=search&list=Simba+Supermarket+Kigali+Rwanda"
                title="Simba Supermarket Kigali"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            {/* Google Maps embed for Simba Centenary */}
            <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.4739!2d30.0588!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSimba+Supermarket+Kigali!5e0!3m2!1sen!2srw!4v1713530000000!5m2!1sen!2srw"
                title="Simba Supermarket location on map"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
        <div className="mb-12">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
            Our {SIMBA_BRANCHES.length} Kigali Branches
          </h2>
          <p className="text-sm text-gray-400 mb-5">
            Most branches open Mon–Sat 8:00 AM–9:00 PM, Sun 9:00 AM–6:00 PM. Nyanza branch closes at 8:00 PM.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SIMBA_BRANCHES.map((b, i) => (
              <a
                key={b.id}
                href={`https://maps.google.com/?q=${encodeURIComponent(b.name + ', Kigali')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-brand font-black text-xs">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-400" />
                    <p className="text-xs text-gray-400 truncate">{b.area}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3 text-gray-300" />
                  <span className="text-[10px] text-gray-400">8:00–21:00</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-brand-dark rounded-2xl p-8 text-center">
          <h2 className="text-xl font-black text-white mb-2">Get in Touch</h2>
          <p className="text-white/60 text-sm mb-6">Questions or feedback? Contact us directly.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:+250788386386"
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-xl font-black text-sm hover:bg-gray-100 transition-colors">
              <Phone className="w-4 h-4" /> +250 788 386 386
            </a>
            <a href="mailto:info@simbaonlineshopping.com"
              className="flex items-center gap-2 px-5 py-3 bg-brand text-white rounded-xl font-black text-sm hover:bg-brand-light transition-colors">
              <Mail className="w-4 h-4" /> Email Us
            </a>
            <a href="https://wa.me/250788386386" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-xl font-black text-sm hover:bg-green-600 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4">
          <Link href="/" className="text-sm font-bold text-brand-dark hover:underline">Back to Store</Link>
          <Link href="/faq" className="text-sm font-bold text-gray-500 hover:text-brand-dark">FAQ</Link>
          <Link href="/contact" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Contact</Link>
          <Link href="/terms" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Terms</Link>
          <Link href="/privacy" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Privacy</Link>
        </div>
      </main>
    </div>
  );
}
