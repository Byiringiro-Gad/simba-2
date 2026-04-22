import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Language, CartItem } from '@/types';

interface Address {
  id: string;
  label: string;
  full: string;
}

interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'delivered' | 'processing' | 'cancelled';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  referralCode?: string;  // user's unique referral code
}

interface SimbaState {
  // Auth
  user: User | null;
  isAuthOpen: boolean;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  scheduledDelivery: 'asap' | 'morning' | 'afternoon' | 'evening';

  // Favorites
  favorites: number[];

  // Recently viewed
  recentlyViewed: number[];  // product IDs

  // Address
  addresses: Address[];
  selectedAddressId: string | null;
  isAddressModalOpen: boolean;

  // Search & filter
  searchQuery: string;
  selectedCategory: string | null;

  // UI
  language: Language;
  isDarkMode: boolean;
  activeTab: 'home' | 'search' | 'favorites' | 'orders' | 'account';

  // Orders
  orders: Order[];

  // Promo
  appliedPromo: string | null;
  promoDiscount: number;

  // Actions — Auth
  login: (user: User) => void;
  logout: () => void;
  setAuthOpen: (open: boolean) => void;

  // Actions — Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setScheduledDelivery: (slot: SimbaState['scheduledDelivery']) => void;

  // Actions — Favorites
  toggleFavorite: (productId: number) => void;

  // Actions — Recently viewed
  addToRecentlyViewed: (productId: number) => void;

  // Actions — Address
  addAddress: (address: Omit<Address, 'id'>) => void;
  selectAddress: (id: string) => void;
  setAddressModalOpen: (open: boolean) => void;

  // Actions — Filter
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string | null) => void;

  // Actions — UI
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: SimbaState['activeTab']) => void;

  // Actions — Orders
  placeOrder: (orderData: { id: string, items: CartItem[], total: number, customerName: string, customerPhone: string, customerAddress: string, userId?: string }) => Promise<boolean>;
  fetchOrders: (userId: string) => Promise<void>;

  // Actions — Promo
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
}

const DEFAULT_ADDRESSES: Address[] = [
  { id: '1', label: 'Home', full: 'KG 11 Ave, Kigali City Center, Rwanda' },
  { id: '2', label: 'Work', full: 'KN 3 Rd, Nyarugenge, Kigali, Rwanda' },
];

const PROMO_CODES: Record<string, number> = {
  'SIMBA10': 10,
  'WELCOME': 15,
  'KIGALI5': 5,
};

export const useSimbaStore = create<SimbaState>()(
  persist(
    (set) => ({
      user: null,
      isAuthOpen: false,
      cart: [],
      isCartOpen: false,
      scheduledDelivery: 'asap',
      favorites: [],
      recentlyViewed: [],
      addresses: DEFAULT_ADDRESSES,
      selectedAddressId: '1',
      isAddressModalOpen: false,
      searchQuery: '',
      selectedCategory: null,
      language: 'en',
      isDarkMode: false,
      activeTab: 'home',
      orders: [],
      appliedPromo: null,
      promoDiscount: 0,

      // Auth
      login: (user) => {
        // Generate referral code if not present
        const code = user.referralCode ?? `SIMBA${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        set({ user: { ...user, referralCode: code }, isAuthOpen: false });
      },
      logout: () => set({ user: null }),
      setAuthOpen: (isAuthOpen) => set({ isAuthOpen }),

      // Cart
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(i => i.id === product.id);
        if (existing) {
          return { cart: state.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter(i => i.id !== id) })),
      updateQuantity: (id, qty) => set((s) => ({
        cart: s.cart.map(i => i.id === id ? { ...i, quantity: Math.max(0, qty) } : i).filter(i => i.quantity > 0)
      })),
      clearCart: () => set({ cart: [], appliedPromo: null, promoDiscount: 0 }),
      setCartOpen: (open) => set({ isCartOpen: open }),
      setScheduledDelivery: (scheduledDelivery) => set({ scheduledDelivery }),

      // Favorites
      toggleFavorite: (id) => set((s) => ({
        favorites: s.favorites.includes(id) ? s.favorites.filter(f => f !== id) : [...s.favorites, id]
      })),

      // Recently viewed
      addToRecentlyViewed: (id) => set((s) => {
        const filtered = s.recentlyViewed.filter(v => v !== id);
        return { recentlyViewed: [id, ...filtered].slice(0, 12) };
      }),

      // Address
      addAddress: (addr) => set((s) => {
        const newAddr = { ...addr, id: Date.now().toString() };
        return { addresses: [...s.addresses, newAddr], selectedAddressId: newAddr.id };
      }),
      selectAddress: (id) => set({ selectedAddressId: id, isAddressModalOpen: false }),
      setAddressModalOpen: (open) => set({ isAddressModalOpen: open }),

      // Filter
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),

      // UI
      setLanguage: (language) => set({ language }),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setActiveTab: (activeTab) => set({ activeTab }),

      // Orders
      placeOrder: async (orderData) => {
        try {
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });
          
          if (!res.ok) throw new Error('Failed to place order');

          const order: Order = { 
            id: orderData.id, 
            date: new Date().toISOString(), 
            items: orderData.items, 
            total: orderData.total, 
            status: 'processing' 
          };
          
          set((s) => ({ orders: [order, ...s.orders] }));
          return true;
        } catch (err) {
          console.error(err);
          return false;
        }
      },

      fetchOrders: async (userId) => {
        try {
          const res = await fetch(`/api/orders?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            // Map created_at to date for compatibility with the store's Order interface
            const formatted = data.map((o: any) => ({
              ...o,
              date: o.createdAt || new Date().toISOString()
            }));
            set({ orders: formatted });
          }
        } catch (err) {
          console.error('Failed to fetch orders', err);
        }
      },

      // Promo
      applyPromo: (code) => {
        const discount = PROMO_CODES[code.toUpperCase()];
        if (discount) { set({ appliedPromo: code.toUpperCase(), promoDiscount: discount }); return true; }
        return false;
      },
      removePromo: () => set({ appliedPromo: null, promoDiscount: 0 }),
    }),
    { name: 'simba-store-v2' }
  )
);
