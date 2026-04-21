export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subcategoryId: number;
  inStock: boolean;
  image: string;
  unit: string;
  // Extended fields (computed/added client-side)
  stockCount?: number;   // for "Only X left" urgency
  rating?: number;       // average rating 1-5
  reviewCount?: number;  // number of reviews
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

export interface CartItem extends Product {
  quantity: number;
  scheduledTime?: string; // scheduled delivery slot
}

export type CheckoutStep = 'cart' | 'details' | 'payment' | 'tracking' | 'success';

export interface Address {
  id: string;
  label: string;
  full: string;
}

export interface Review {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;       // 1-5
  comment: string;
  date: string;
  verified: boolean;
}

export type DeliverySlot = 'asap' | 'morning' | 'afternoon' | 'evening';
