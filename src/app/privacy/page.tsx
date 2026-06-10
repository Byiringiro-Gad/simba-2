import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Simba Supermarket',
  description: 'Privacy Policy for Simba Supermarket Online Shopping — how we collect, use and protect your personal data.',
};

export default function PrivacyPage() {
  const lastUpdated = '1 January 2025';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Simple header */}
      <div className="bg-[#FF6600] px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to store
          </Link>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-20">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {lastUpdated}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p>Simba Supermarket Ltd ("Simba", "we", "us", "our") operates the Simba Supermarket Online Shopping platform at <strong>simbaonlineshopping.com</strong> and its associated web application. We are committed to protecting your personal data and your right to privacy.</p>
            <p className="mt-2">This Privacy Policy explains how we collect, use, disclose and safeguard your information when you visit our platform or place an order. Please read it carefully. If you disagree with its terms, please discontinue use of the site.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p><strong>Personal information you provide:</strong></p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Name and email address (when you create an account)</li>
              <li>Phone number (for order confirmation and pickup notifications)</li>
              <li>Payment method identifier (MTN MoMo number, Airtel Money number, or card reference — we do not store full card numbers)</li>
              <li>Order history and items purchased</li>
              <li>Reviews and ratings you submit</li>
            </ul>
            <p className="mt-3"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Browser type, device type, operating system</li>
              <li>Pages visited and time spent on the platform</li>
              <li>Search queries entered on the platform</li>
              <li>Cookies and similar tracking technologies (see Section 7)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfil your orders, including notifying the relevant Simba branch</li>
              <li>To send order confirmations and status updates via email or SMS</li>
              <li>To manage your account and loyalty points</li>
              <li>To improve our platform, product listings and user experience</li>
              <li>To detect and prevent fraud or abuse (e.g., tracking no-show patterns)</li>
              <li>To comply with legal obligations under Rwandan law</li>
              <li>To respond to your customer service requests</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> sell your personal data to third parties. We do not use your data for unsolicited marketing without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">4. Data Sharing</h2>
            <p>We may share your personal data with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Simba branch staff</strong> — to prepare and hand over your order (name, phone number, order details)</li>
              <li><strong>Payment processors</strong> — MTN Mobile Money and Airtel Money for deposit collection</li>
              <li><strong>Service providers</strong> — cloud hosting (database and storage services) under strict data processing agreements</li>
              <li><strong>Rwandan authorities</strong> — where required by law or valid legal process</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as your account is active or as needed to provide you with services. You may request deletion of your account and associated data at any time by contacting <a href="mailto:info@simbaonlineshopping.com" className="text-brand-dark hover:underline">info@simbaonlineshopping.com</a>.</p>
            <p className="mt-2">Order records are retained for a minimum of 5 years to comply with Rwandan financial and commercial record-keeping requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">6. Your Rights</h2>
            <p>Under applicable Rwandan data protection law and international best practice, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Access</strong> — Request a copy of your personal data</li>
              <li><strong>Rectification</strong> — Correct inaccurate or incomplete data</li>
              <li><strong>Erasure</strong> — Request deletion of your personal data</li>
              <li><strong>Restriction</strong> — Ask us to restrict processing of your data</li>
              <li><strong>Portability</strong> — Receive your data in a machine-readable format</li>
              <li><strong>Objection</strong> — Object to processing for direct marketing purposes</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:info@simbaonlineshopping.com" className="text-brand-dark hover:underline">info@simbaonlineshopping.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">7. Cookies</h2>
            <p>We use essential cookies to maintain your session, remember your cart and language preferences. We do not use third-party advertising cookies. You may disable cookies in your browser settings, but this may affect platform functionality.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">8. Security</h2>
            <p>We implement industry-standard technical and organisational measures to protect your personal data, including encrypted database storage, HTTPS communications, and access controls limiting which staff can view customer data. However, no internet transmission is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">9. Children's Privacy</h2>
            <p>Our platform is not directed at children under 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us personal data, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes by email or by a notice on the platform. The "Last updated" date at the top of this page will always reflect the current version.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-3">11. Contact Us</h2>
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
          <Link href="/terms" className="text-sm font-bold text-gray-500 hover:text-brand-dark">Terms of Service →</Link>
        </div>
      </main>
    </div>
  );
}
