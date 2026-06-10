import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Simba Supermarket',
  description: 'Terms and conditions for using Simba Supermarket Online Shopping platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-[#FF6600] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: 1 January 2025</p>

        <div className="space-y-8 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the Simba Supermarket Online Shopping platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. These terms apply to all users, including browsers, customers, and branch staff.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">2. About the Service</h2>
            <p>Simba Supermarket Ltd operates an online platform that allows customers in Kigali, Rwanda to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Browse and select products from the Simba Supermarket catalogue</li>
              <li>Place pickup orders at any of our 9 Kigali branches</li>
              <li>Pay a refundable deposit to secure their order</li>
              <li>Collect their prepared order from the selected branch within the chosen time window</li>
            </ul>
            <p className="mt-2 font-medium">This platform currently provides <strong>in-store pickup only</strong>. Home delivery is not available at this time.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate, complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your password</li>
              <li>You must be at least 18 years old to create an account and place orders</li>
              <li>One account per person — multiple accounts for the same individual are not permitted</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">4. Orders and Pickup</h2>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">4.1 Placing an Order</h3>
            <p>When you place an order, you agree to pay the deposit amount shown at checkout (minimum 500 RWF). The deposit is charged via MTN Mobile Money, Airtel Money, or card at the time of ordering.</p>

            <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.2 Deposit Policy</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>The deposit (500 RWF standard) reserves your order and covers branch preparation time</li>
              <li>The remaining balance is paid in full at the branch upon pickup</li>
              <li>Deposits are non-refundable if you fail to collect your order without prior cancellation</li>
              <li>Repeat no-shows may result in higher deposit requirements (750–1,000 RWF) or account suspension</li>
            </ul>

            <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.3 Pickup Windows</h3>
            <p>Orders must be collected within the selected pickup time window. Branch opening hours are 8:00 AM – 9:00 PM Monday to Saturday and 9:00 AM – 6:00 PM on Sundays (Nyanza branch closes at 8:00 PM). Orders not collected by closing time will be cancelled.</p>

            <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.4 Cancellations</h3>
            <p>You may cancel your order before the branch begins preparation. To cancel, contact the branch directly or use the order management interface. Cancellations after preparation begins are subject to branch discretion.</p>

            <h3 className="font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">4.5 Product Availability</h3>
            <p>Product availability is subject to branch-level stock. In the event an item is unavailable, branch staff will notify you and offer substitution or a partial refund of the deposit proportional to unavailable items.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">5. Pricing</h2>
            <p>All prices are displayed in Rwandan Francs (RWF) and include applicable taxes. Simba Supermarket reserves the right to change prices at any time. The price shown at the time you place your order is the price you will pay.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">6. Prohibited Items</h2>
            <p>By placing an order, you confirm you are of legal age to purchase any age-restricted products (e.g., alcoholic beverages, tobacco products). Simba branch staff reserve the right to request identification at pickup. Orders for age-restricted items without valid ID will not be fulfilled and deposits will be forfeited.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">7. Loyalty Points Programme</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>1 loyalty point is awarded per 100 RWF spent (excluding deposit)</li>
              <li>Points are credited after order completion (pickup confirmed)</li>
              <li>Points tiers: Bronze (0–199 pts), Silver (200–499 pts), Gold (500+ pts)</li>
              <li>Points have no cash value and cannot be transferred between accounts</li>
              <li>Simba reserves the right to modify or discontinue the loyalty programme with 30 days' notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">8. Promotional Codes</h2>
            <p>Promotional codes are valid for a single use per customer unless otherwise stated. Codes cannot be combined with other promotions. Simba reserves the right to void codes used fraudulently or in violation of these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">9. Intellectual Property</h2>
            <p>All content on this platform, including text, images, logos, and software, is the property of Simba Supermarket Ltd or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">10. Limitation of Liability</h2>
            <p>To the fullest extent permitted by Rwandan law, Simba Supermarket Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability for any claim arising from these terms shall not exceed the amount of the deposit paid for the relevant order.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">11. Governing Law</h2>
            <p>These Terms are governed by the laws of the Republic of Rwanda. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kigali, Rwanda.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">12. Changes to These Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify registered users of material changes. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">13. Contact</h2>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 space-y-2">
              <p className="font-black text-gray-900 dark:text-white">Simba Supermarket Ltd</p>
              <p>Simba Centenary, KN 4 Ave, Kigali, Rwanda</p>
              <p>Email: <a href="mailto:info@simbaonlineshopping.com" className="text-brand-dark hover:underline">info@simbaonlineshopping.com</a></p>
              <p>Phone: <a href="tel:+250788386386" className="text-brand-dark hover:underline">+250 788 386 386</a></p>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
          <Link href="/" className="text-sm font-bold text-brand-dark hover:underline">← Back to Store</Link>
          <Link href="/privacy" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  );
}
