import { getSimbaData } from '@/lib/data';
import type { Metadata } from 'next';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { products } = getSimbaData();
  const product = products.find(p => p.id === Number(params.id));

  if (!product) {
    return {
      title: 'Product Not Found | Simba Supermarket',
      description: 'This product could not be found on Simba Supermarket.',
    };
  }

  return {
    title: `${product.name} | Simba Supermarket`,
    description: `${product.name} — ${product.category}. Available for pickup at Simba Supermarket branches across Kigali. Price: ${product.price.toLocaleString()} RWF. Order online and pick up in 20-45 minutes.`,
    openGraph: {
      title: `${product.name} | Simba Supermarket`,
      description: `${product.category} · ${product.price.toLocaleString()} RWF · Pickup in 20-45 min`,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
      type: 'website',
      siteName: 'Simba Supermarket',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Simba Supermarket`,
      description: `${product.price.toLocaleString()} RWF · Available at Simba Supermarket, Kigali`,
      images: [product.image],
    },
  };
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
