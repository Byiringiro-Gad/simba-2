import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ | Simba Supermarket',
  description: 'Frequently asked questions about ordering, pickup, payments and more at Simba Supermarket Online.',
};

const FAQS = [
  {
    category: 'Ordering',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse products, add items to your cart, then tap "Checkout". Choose your nearest Simba branch, select a pickup time, and pay the 500 RWF deposit. Your order is sent to the branch immediately.',
      },
      {
        q: 'Do you offer home delivery?',
        a: 'Not currently. Simba Online Shopping is a pickup service only. You select a branch, we prepare your basket, and you collect it in person at the branch within your chosen time window.',
      },
      {
        q: 'Can I order for someone else to pick up?',
        a: 'Yes. During checkout, enter the name of the person who will collect the order. They will need to quote the order ID (#SIMB-XXXXX) at the branch.',
      },
      {
        q: 'Can I modify my order after placing it?',
        a: 'Once an order is sent to the branch, it cannot be modified through the app. Contact the branch directly by phone as soon as possible if you need to make changes.',
      },
    ],
  },
  {
    category: 'Pickup & Branches',
    items: [
      {
        q: 'How long until my order is ready?',
        a: 'Most orders are ready within 20–45 minutes of placement. The exact time depends on order size and branch activity. You will choose a pickup window at checkout.',
      },
      {
        q: 'Which branches are available?',
        a: 'We have 9 branches across Kigali: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, and Nyanza.',
      },
      {
        q: 'What are your opening hours?',
        a: 'Most branches are open Monday–Saturday 8:00 AM – 9:00 PM and Sunday 9:00 AM – 6:00 PM. The Nyanza branch closes at 8:00 PM daily.',
      },
      {
        q: 'What if a product is out of stock at my branch?',
        a: 'Branch staff will contact you and offer a suitable substitute or adjust your order. If items cannot be fulfilled, the deposit is refunded proportionally.',
      },
    ],
  },
  {
    category: 'Payment & Deposit',
    items: [
      {
        q: 'What is the deposit for?',
        a: 'A 500 RWF deposit is required to confirm your order and reserve the branch\'s preparation time. This reduces no-show orders and ensures branches prepare only confirmed baskets. The remaining balance is paid in cash or card at the branch during pickup.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'For the online deposit: MTN Mobile Money (MoMo), Airtel Money, and debit/credit card. For the balance at pickup: cash, MTN MoMo, Airtel Money, or card.',
      },
      {
        q: 'Is my deposit refundable?',
        a: 'If you cancel your order before branch preparation begins, your deposit is refunded. If you do not show up to collect and do not cancel, the deposit is forfeited. Repeated no-shows may result in a higher deposit requirement (750–1,000 RWF).',
      },
      {
        q: 'Can I use a promo code?',
        a: 'Yes. Enter your promo code in the cart before proceeding to checkout. Valid codes include SIMBA10 (10% off), WELCOME (15% off for new users), and KIGALI5 (5% off). Codes can only be applied to the basket total, not the deposit.',
      },
    ],
  },
  {
    category: 'Account & Loyalty',
    items: [
      {
        q: 'Do I need an account to order?',
        a: 'Yes, an account is required to place an order. This ensures you can track your orders, earn loyalty points, and manage your order history. Registration is free and takes under 1 minute.',
      },
      {
        q: 'How do loyalty points work?',
        a: 'You earn 1 loyalty point for every 100 RWF spent (excluding deposit). Reach 200 points for Silver tier and 500 points for Gold tier. Points are credited after your order is collected.',
      },
      {
        q: 'What are the loyalty tier benefits?',
        a: 'Bronze (0–199 pts): Standard access. Silver (200–499 pts): Early access to flash deals. Gold (500+ pts): Priority order prep and exclusive promo codes. Tier benefits are expanded as the platform grows.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Email info@simbaonlineshopping.com to request account deletion. Your personal data will be removed within 30 days, subject to legal record-keeping obligations.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'What languages is the platform available in?',
        a: 'English, French (Français), and Kinyarwanda. Switch languages using the globe icon in the top navigation bar.',
      },
      {
        q: 'Is there a mobile app?',
        a: 'The web platform is fully optimised for mobile browsers — it works like a native app on iPhone and Android. A dedicated app may be released in the future.',
      },
      {
        q: 'How do I contact support?',
        a: 'Call us on +250 788 386 386, email info@simbaonlineshopping.com, or use WhatsApp at wa.me/250788386386. Our team is available during branch hours.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#FF6600] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors w-fit">
            <ChevronLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-sm text-gray-400 mb-10">Everything you need to know about ordering from Simba Supermarket Online.</p>

        <div className="space-y-10">
          {FAQS.map(({ category, items }) => (
            <section key={category}>
              <h2 className="text-base font-black text-brand-dark dark:text-brand uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="h-px flex-1 bg-brand/20" />
                {category}
                <span className="h-px flex-1 bg-brand/20" />
              </h2>
              <div className="space-y-3">
                {items.map(({ q, a }) => (
                  <details key={q} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer font-bold text-sm text-gray-900 dark:text-white list-none select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      {q}
                      <span className="w-5 h-5 flex-shrink-0 text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                    </summary>
                    <div className="px-5 pb-4 pt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800">
                      {a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-12 bg-brand-dark rounded-3xl p-8 text-center">
          <p className="font-black text-white text-lg mb-2">Still have questions?</p>
          <p className="text-white/60 text-sm mb-5">Our team is available during branch hours (Mon–Sat 8am–9pm).</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="tel:+250788386386" className="px-5 py-2.5 bg-white text-gray-900 rounded-xl font-black text-sm hover:bg-gray-100 transition-colors">
              Call Us
            </a>
            <a href="mailto:info@simbaonlineshopping.com" className="px-5 py-2.5 bg-brand text-gray-900 rounded-xl font-black text-sm hover:bg-brand-light transition-colors">
              Email Us
            </a>
            <a href="https://wa.me/250788386386" target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-green-500 text-white rounded-xl font-black text-sm hover:bg-green-600 transition-colors">
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4">
          <Link href="/" className="text-sm font-bold text-brand-dark hover:underline">← Back to Store</Link>
          <Link href="/about" className="text-sm font-bold text-gray-500 hover:text-brand-dark">About Us →</Link>
        </div>
      </main>
    </div>
  );
}
