import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { SIMBA_BRANCHES } from '@/lib/branches';

export const metadata: Metadata = {
  title: 'Contact Us | Simba Supermarket',
  description: 'Contact Simba Supermarket — phone, email, WhatsApp, and branch locations in Kigali.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#FF6600] px-4 sm:px-6 py-4">
        <div className="max-w-screen-lg mx-auto">
          <Link href="/" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </div>

      <main className="max-w-screen-lg mx-auto px-4 sm:px-6 py-12 pb-20">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Contact Us</h1>
        <p className="text-sm text-gray-400 mb-10">Questions, feedback, or need help with your order? We're here.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Contact methods */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-5">Get in Touch</h2>

            {[
              {
                icon: Phone,
                label: 'Call Us',
                value: '+250 788 386 386',
                href: 'tel:+250788386386',
                sub: 'Mon–Sat 8am–9pm · Sun 9am–6pm',
                color: 'bg-blue-500',
              },
              {
                icon: MessageCircle,
                label: 'WhatsApp',
                value: '+250 788 386 386',
                href: 'https://wa.me/250788386386',
                sub: 'Fast responses during business hours',
                color: 'bg-green-500',
                external: true,
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'info@simbaonlineshopping.com',
                href: 'mailto:info@simbaonlineshopping.com',
                sub: 'We respond within 1 business day',
                color: 'bg-purple-500',
              },
              {
                icon: MapPin,
                label: 'Head Office',
                value: 'Simba Centenary, KN 4 Ave, Kigali',
                href: 'https://maps.google.com/?q=Simba+Centenary+KN+4+Ave+Kigali',
                sub: 'Kigali, Rwanda',
                color: 'bg-orange-500',
                external: true,
              },
            ].map(({ icon: Icon, label, value, href, sub, color, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                  <p className="font-black text-sm text-gray-900 dark:text-white mt-0.5">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </a>
            ))}

            {/* Hours */}
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-brand" />
                <p className="font-black text-sm text-gray-900 dark:text-white">Store Hours</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Monday – Saturday</span>
                  <span className="font-bold text-gray-900 dark:text-white">8:00 AM – 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sunday</span>
                  <span className="font-bold text-gray-900 dark:text-white">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 italic">Nyanza branch</span>
                  <span className="font-bold text-gray-900 dark:text-white">8:00 AM – 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Branches */}
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-5">Our {SIMBA_BRANCHES.length} Branches</h2>
            <div className="space-y-2">
              {SIMBA_BRANCHES.map((b, i) => (
                <a
                  key={b.id}
                  href={`https://maps.google.com/?q=${b.name}+Kigali`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-brand/30 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-brand font-black text-xs">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.area}</p>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                </a>
              ))}
            </div>

            {/* Map embed */}
            <div className="mt-4 rounded-2xl overflow-hidden h-48 border border-gray-100 dark:border-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15948.5!2d30.0588!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srw!4v1713530000000!5m2!1sen!2srw"
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Simba Supermarket Kigali locations"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4">
          <Link href="/" className="text-sm font-bold text-brand-dark hover:underline">← Back to Store</Link>
          <Link href="/faq" className="text-sm font-bold text-gray-500 hover:text-brand-dark">FAQ →</Link>
        </div>
      </main>
    </div>
  );
}
