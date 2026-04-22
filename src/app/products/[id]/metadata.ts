import { Metadata } from 'next';
import { getSimbaData } from '@/lib/data';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = getSimbaData();
  const product = data.products.find(p => p.id === Number(params.id));

  if (!product) {
    return {
      title: 'Product Not Found | Simba Supermarket',
      description: 'This product could not be found.',
    };
  }

  return {
    title: `${product.name} | Simba Supermarket`,
    description: `Buy ${product.name} at ${product.price.toLocaleString()} RWF. Fast delivery across Kigali in 45 minutes. ${product.category} at Simba Supermarket.`,
    openGraph: {
      title: `${product.name} | Simba Supermarket`,
      description: `${product.name} — ${product.price.toLocaleString()} RWF. Delivered in 45 min across Kigali.`,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Simba Supermarket`,
      description: `${product.name} — ${product.price.toLocaleString()} RWF`,
      images: [product.image],
    },
  };
}
