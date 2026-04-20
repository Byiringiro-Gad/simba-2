import { SimbaData } from '@/types';
import productsData from '../../simba_products.json';

let cachedData: SimbaData | null = null;

export const getSimbaData = (): SimbaData => {
  if (!cachedData) {
    cachedData = productsData as SimbaData;
  }
  return cachedData;
};

export const getCategories = (): string[] => {
  const data = getSimbaData();
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const p of data.products) {
    if (!seen.has(p.category)) {
      seen.add(p.category);
      categories.push(p.category);
    }
  }
  return categories;
};

export const getProductById = (id: number) => {
  const data = getSimbaData();
  return data.products.find(p => p.id === id) ?? null;
};

export const getRelatedProducts = (product: { id: number; category: string }, limit = 8) => {
  const data = getSimbaData();
  return data.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
};

