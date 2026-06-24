import { SimbaData } from '@/types';
import productsData from '../../simba_products.json';

let cachedData: SimbaData | null = null;

// ── Category correction map ───────────────────────────────────────────────────
// Several product IDs were assigned wrong categories in the source JSON.
// This map overrides them at runtime without altering the JSON file.
const CATEGORY_OVERRIDES: Record<number, string> = {
  // Bakery/bread items → Food Products
  61001:1, 61003:1, 61005:1, 61006:1, 61007:1, 61008:1, 61009:1,
  61010:1, 61011:1, 61012:1, 61013:1, 61014:1,
  // Dairy/milk → Food Products
  66001:1, 66002:1, 66003:1, 66005:1, 66006:1, 66007:1, 66008:1, 66009:1, 66010:1,
  // Coffee → Food Products
  74001:1, 74002:1, 74003:1, 74004:1, 74005:1, 74006:1, 74007:1, 74008:1,
  74009:1, 74010:1, 74011:1, 74012:1,
  // Hand wash mismatch
  245026:1,
  // Jams → Food Products
  258001:1, 258002:1, 258003:1, 258004:1, 258005:1, 258006:1, 258007:1, 258008:1,
  258009:1, 258010:1, 258011:1, 258012:1, 258013:1, 258014:1, 258015:1, 258016:1,
  258017:1, 258018:1,
  // Candy/sweets → Food Products
  366001:1, 366002:1, 366003:1, 366004:1, 366005:1, 366007:1, 366008:1, 366009:1,
  366010:1, 366011:1, 366012:1, 366013:1, 366014:1, 366015:1,
  367001:1, 367002:1, 367003:1, 367004:1, 367006:1, 367007:1, 367008:1, 367009:1,
  367010:1, 367011:1, 367012:1, 367013:1, 367014:1, 367015:1, 367016:1, 367017:1,
  367018:1, 367019:1, 367020:1, 367021:1, 367022:1,
  // Fresh fruits → Food Products
  664001:1, 664002:1, 664003:1, 664004:1, 664005:1, 664006:1, 664007:1, 664009:1, 664010:1,
  // Farmer's Choice sausages / pet food → Pet Care
  62003:2,
  354001:2, 354002:2, 354003:2, 354004:2, 354005:2, 354006:2, 354007:2, 354008:2, 354009:2,
  // Farmer's Choice sausages in Pet Care range
  471001:2, 471002:2, 471003:2, 471004:2, 471005:2, 471006:2, 471007:2, 471008:2,
  471009:2, 471010:2, 471011:2, 471012:2, 471013:2, 471014:2, 471015:2, 471016:2,
};
const CAT_CODE: Record<number, string> = {
  1: 'Food Products',
  2: 'Pet Care',
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
          return override ? { ...p, category: CAT_CODE[override] } : p;
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

