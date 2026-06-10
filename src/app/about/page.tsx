import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, MapPin, Clock, Phone, Mail, ShoppingBag, Users, Star, Package } from 'lucide-react';
import { SIMBA_BRANCHES } from '@/lib/branches';

export const metadata: Metadata = {
  title: 'About Us | Simba Supermarket',
  description: 'About Simba Supermarket — Rwanda\'s trusted supermarket since 2007, with 9 branches across Kigali and 700+ products.',
};

export default function AboutPage() {
  const stats = [
    { icon: ShoppingBag, value: '700+', label: 'Products' },
    { icon: MapPin,      value: `${SIMBA_BRANCHES.length}`,  label: 'Branches in Kigali' },
    { icon: Users,       value: '2007', label: 'Founded' },
    { icon: Star,        value: '20–45', label: 'Min pickup' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
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
            <span className="font-black text-white text-sm">Simba Supermarket</span>
          </Link>
        </div>
      </div>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-12 pb-20">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-[#FF6600] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/30 overflow-hidden">
            <Image src="/simba-icon.png" alt="Simba" width={60} height={60} className="object-contain" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">About Simba Supermarket</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Rwanda's trusted supermarket since 2007, serving Kigali families with quality products, honest pricing, and friendly service across 9 branches.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
              <Icon className="w-6 h-6 text-brand mx-auto mb-3" />
              <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Our Story</h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>Simba Supermarket was founded in 2007 in Kigali, Rwanda, with a simple mission: to provide Rwandan families with access to quality everyday products at fair prices.</p>
              <p>What started as a single branch has grown into one of Kigali's most recognised supermarket chains, with 9 branches spread across key neighbourhoods including Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, and Nyanza.</p>
              <p>Our product catalogue spans over 700 items across categories including Groceries, Bakery, Cosmetics, Baby Products, Electronics, Kitchenware, Sports & Wellness, Cleaning & Sanitary products, Alcoholic Beverages, Pet Care, and more.</p>
              <p>This online platform was built to make it easier for customers to browse our full catalogue, place orders in advance, and pick up their basket ready-prepared — so you spend less time in queues and more time doing what matters.</p>
            </div>
          </div>
          <div className="relative h-64 lg:h-auto rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-800">
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
              alt="Simba Supermarket interior"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <p className="text-white font-black text-sm">Since 2007 · Kigali, Rwanda</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 mb-14">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">How Online Pickup Works</h2>
          <p className="text-sm text-gray-400 mb-8">Order online. Pick up in person. No delivery, no waiting — just fresh and ready.</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: '01', icon: ShoppingBag, title: 'Browse & Add to Cart', desc: 'Browse 700+ products and add what you need to your cart. Filter by category or search.' },
              { step: '02', icon: MapPin,      title: 'Choose Your Branch', desc: 'Select one of 9 Simba branches in Kigali as your pickup location.' },
              { step: '03', icon: Package,     title: 'Pay a Deposit', desc: 'Pay a small 500 RWF deposit via MTN MoMo, Airtel Money, or card. The rest is paid at pickup.' },
              { step: '04', icon: Star,        title: 'Pick Up in 20–45 Min', desc: 'Your order is prepared by branch staff and ready for collection in 20–45 minutes.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mb-4 relative">
                  <Icon className="w-6 h-6 text-brand" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand text-white text-[9px] font-black rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Branches */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Our {SIMBA_BRANCHES.length} Kigali Branches</h2>
          <p className="text-sm text-gray-400 mb-6">All branches are open Monday–Saturday 8:00 AM – 9:00 PM and Sunday 9:00 AM – 6:00 PM (Nyanza closes at 8:00 PM).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SIMBA_BRANCHES.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-brand font-black text-sm">{i + 1}</span>
                </div>
                <div>
                  <p className="font-black text-sm text-gray-900 dark:text-white">{b.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-400" />
                    <p className="text-xs text-gray-400">{b.area}</p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-300" />
                  <span className="text-[10px] text-gray-400">08:00-21:00</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-brand-dark rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-black text-white mb-2">Get in Touch</h2>
          <p className="text-white/60 text-sm mb-6">Questions, feedback or partnerships? We'd love to hear from you.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+250788386386"
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-2xl font-black text-sm hover:bg-gray-100 transition-colors">
              <Phone className="w-4 h-4" /> +250 788 386 386
            </a>
            <a href="mailto:info@simbaonlineshopping.com"
              className="flex items-center gap-2 px-5 py-3 bg-brand text-gray-900 rounded-2xl font-black text-sm hover:bg-brand-light transition-colors">
              <Mail className="w-4 h-4" /> info@simbaonlineshopping.com
            </a>
            <a href="https://wa.me/250788386386" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 bg-green-500 text-white rounded-2xl font-black text-sm hover:bg-green-600 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4">
          <Link href="/" className="text-sm font-bold text-brand-dark hover:underline">← Back to Store</Link>
          <Link href="/faq" className="text-sm font-bold text-gray-500 hover:text-brand-dark">FAQ →</Link>
          <Link href="/terms" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Terms →</Link>
          <Link href="/privacy" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Privacy →</Link>
        </div>
      </main>
    </div>
  );
}
