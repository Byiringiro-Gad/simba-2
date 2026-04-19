export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
}

export interface StoreInfo {
  name: string;
  tagline: string;
  location: string;
  currency: string;
}

export interface SimbaData {
  store: StoreInfo;
  products: Product[];
}

export type Language = 'en' | 'fr' | 'rw';
