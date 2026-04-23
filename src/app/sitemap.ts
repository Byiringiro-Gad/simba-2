import { MetadataRoute } from 'next';
import { getSimbaData } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getSimbaData();
  const base = 'https://simba2gad.vercel.app';

  const productUrls = data.products.map(p => ({
    url: `${base}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...productUrls,
  ];
}
