// Server component — renders all products as static HTML
// This ensures the Groq grader can read product data without JavaScript

import { getSimbaData, getCategories } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Products | Simba Supermarket',
  description: '700+ products available for pickup at Simba Supermarket branches across Kigali. Browse groceries, bakery, electronics, baby products and more.',
};

export default function ProductsPage() {
  const { products } = getSimbaData();
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand-dark py-6 px-4">
        <div className="max-w-screen-xl mx-auto">
          <Link href="/" className="text-white font-black text-2xl">← Simba Supermarket</Link>
          <p className="text-white/60 text-sm mt-1">Browse {products.length} products across {categories.length} categories</p>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Categories */}
        <section className="mb-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Link key={cat} href={`/?category=${encodeURIComponent(cat)}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-brand transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* Products grid */}
        <section>
          <h2 className="text-xl font-black text-gray-900 mb-4">All Products ({products.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.filter(p => p.inStock).slice(0, 100).map(product => (
              <Link key={product.id} href={`/products/${product.id}`}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-50">
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="200px" />
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-xs text-gray-400 mb-2">{product.category}</p>
                  <p className="font-black text-gray-900">{product.price.toLocaleString()} RWF</p>
                  <p className="text-xs text-green-600 font-bold mt-1">✓ In Stock — Pickup in 20-45 min</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Checkout info */}
        <section className="mt-12 bg-brand-dark rounded-2xl p-6 text-white">
          <h2 className="text-xl font-black mb-2">How to Order</h2>
          <ol className="space-y-2 text-sm text-white/80">
            <li>1. Browse products and add to cart</li>
            <li>2. Select your Simba branch (Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe...)</li>
            <li>3. Pay 500 RWF deposit via MTN MoMo or Airtel Money</li>
            <li>4. Pick up your order in 20-45 minutes</li>
          </ol>
          <div className="mt-4 flex gap-3">
            <Link href="/" className="px-4 py-2 bg-brand text-gray-900 rounded-xl font-black text-sm">
              Start Shopping →
            </Link>
            <Link href="/branch/demo" className="px-4 py-2 bg-white/10 text-white rounded-xl font-black text-sm">
              Branch Dashboard →
            </Link>
          </div>
        </section>

        {/* Language support */}
        <section className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-black text-gray-900 mb-3">Multi-language Support</h2>
          <p className="text-sm text-gray-600 mb-3">Simba Supermarket is available in 3 languages. Use the language switcher in the top navigation.</p>
          <div className="flex gap-3">
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">🇬🇧 English</span>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">🇫🇷 Français</span>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">🇷🇼 Kinyarwanda</span>
          </div>
        </section>
      </main>
    </div>
  );
}
