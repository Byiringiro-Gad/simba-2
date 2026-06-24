import { SimbaData } from '@/types';
import productsData from '../../simba_products.json';

let cachedData: SimbaData | null = null;

// ── Category correction map ───────────────────────────────────────────────────
// Several product IDs were assigned wrong categories in the source JSON.
// This map overrides them at runtime without altering the JSON file.
const CATEGORY_OVERRIDES: Record<number, string> = {
  // Bakery/bread items → Food Products
  61001:'Food Products', 61003:'Food Products', 61005:'Food Products', 61006:'Food Products',
  61007:'Food Products', 61008:'Food Products', 61009:'Food Products', 61010:'Food Products',
  61011:'Food Products', 61012:'Food Products', 61013:'Food Products', 61014:'Food Products',
  // Dairy/milk → Food Products
  66001:'Food Products', 66002:'Food Products', 66003:'Food Products', 66005:'Food Products',
  66006:'Food Products', 66007:'Food Products', 66008:'Food Products', 66009:'Food Products', 66010:'Food Products',
  // Coffee → Food Products
  74001:'Food Products', 74002:'Food Products', 74003:'Food Products', 74004:'Food Products',
  74005:'Food Products', 74006:'Food Products', 74007:'Food Products', 74008:'Food Products',
  74009:'Food Products', 74010:'Food Products', 74011:'Food Products', 74012:'Food Products',
  // Hand wash mismatch
  245026:'Food Products',
  // Jams → Food Products
  258001:'Food Products', 258002:'Food Products', 258003:'Food Products', 258004:'Food Products',
  258005:'Food Products', 258006:'Food Products', 258007:'Food Products', 258008:'Food Products',
  258009:'Food Products', 258010:'Food Products', 258011:'Food Products', 258012:'Food Products',
  258013:'Food Products', 258014:'Food Products', 258015:'Food Products', 258016:'Food Products',
  258017:'Food Products', 258018:'Food Products',
  // Candy/sweets → Food Products
  366001:'Food Products', 366002:'Food Products', 366003:'Food Products', 366004:'Food Products',
  366005:'Food Products', 366007:'Food Products', 366008:'Food Products', 366009:'Food Products',
  366010:'Food Products', 366011:'Food Products', 366012:'Food Products', 366013:'Food Products',
  366014:'Food Products', 366015:'Food Products',
  367001:'Food Products', 367002:'Food Products', 367003:'Food Products', 367004:'Food Products',
  367006:'Food Products', 367007:'Food Products', 367008:'Food Products', 367009:'Food Products',
  367010:'Food Products', 367011:'Food Products', 367012:'Food Products', 367013:'Food Products',
  367014:'Food Products', 367015:'Food Products', 367016:'Food Products', 367017:'Food Products',
  367018:'Food Products', 367019:'Food Products', 367020:'Food Products', 367021:'Food Products',
  367022:'Food Products',
  // Fresh fruits → Food Products
  664001:'Food Products', 664002:'Food Products', 664003:'Food Products', 664004:'Food Products',
  664005:'Food Products', 664006:'Food Products', 664007:'Food Products', 664009:'Food Products', 664010:'Food Products',
  // Farmer's Choice sausages / pet food → Pet Care
  62003:'Pet Care',
  354001:'Pet Care', 354002:'Pet Care', 354003:'Pet Care', 354004:'Pet Care', 354005:'Pet Care',
  354006:'Pet Care', 354007:'Pet Care', 354008:'Pet Care', 354009:'Pet Care',
  471001:'Pet Care', 471002:'Pet Care', 471003:'Pet Care', 471004:'Pet Care', 471005:'Pet Care',
  471006:'Pet Care', 471007:'Pet Care', 471008:'Pet Care', 471009:'Pet Care', 471010:'Pet Care',
  471011:'Pet Care', 471012:'Pet Care', 471013:'Pet Care', 471014:'Pet Care', 471015:'Pet Care',
  471016:'Pet Care',
};

export const getSimbaData = (): SimbaData => {
  if (!cachedData) {
    const raw = productsData as any;
    const rawProducts = Array.isArray(raw) ? raw : (raw.products ?? []);
    cachedData = {
      store: raw.store ?? { name: 'Simba Supermarket', tagline: "Rwanda's #1 Supermarket", location: 'Kigali, Rwanda', currency: 'RWF' },
      products: rawProducts
        .filter((p: any) => p.price >= 10 && p.image && p.image.length > 0)
        .map((p: any) => {
          const override = CATEGORY_OVERRIDES[p.id];
          return override ? { ...p, category: override } : p;
        }),
    } as SimbaData;
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

