import { MetadataRoute } from 'next';
import { getSimbaData } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getSimbaData();
  const base = 'https://simba2gad.vercel.app';

  const productUrls = data.products.map(p => ({
    url: `${base}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    // Main pages
    { url: base,                    lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${base}/staff`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/branch`,        lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${base}/branch/demo`,   lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${base}/branch/staff`,  lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${base}/admin`,         lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    // Product pages
    ...productUrls,
  ];
}
