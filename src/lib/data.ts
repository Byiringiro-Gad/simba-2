import { SimbaData } from '@/types';
import productsData from '../../simba_products.json';

export const getSimbaData = (): SimbaData => {
  return productsData as SimbaData;
};

export const getCategories = () => {
  const data = getSimbaData();
  const categories = Array.from(new Set(data.products.map(p => p.category)));
  return categories;
};
