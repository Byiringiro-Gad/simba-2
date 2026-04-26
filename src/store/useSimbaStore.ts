import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Language, CartItem } from '@/types';
import { PickupSlotId, SIMBA_BRANCHES } from '@/lib/branches';

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
  pickupBranch?: string;
  pickupSlot?: PickupSlotId;
  depositAmount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  referralCode?: string;  // user's unique referral code
  loyaltyPoints?: number;
}

interface SimbaState {
  // Auth
  user: User | null;
  authToken: string | null;
  isAuthOpen: boolean;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  pickupSlot: PickupSlotId;
  pickupBranchId: string;
  isPickupBranchModalOpen: boolean;

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

  // Inventory — per-branch stock map: { productId: { stockCount, isAvailable } }
  branchInventory: Record<number, { stockCount: number; isAvailable: boolean }>;

  // Branch ratings — { branchId: { total, avgRating } }
  branchRatings: Record<string, { total: number; avgRating: number }>;

  // Promo
  appliedPromo: string | null;
  promoDiscount: number;

  // Actions — Auth
  login: (user: User, authToken: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setAuthOpen: (open: boolean) => void;

  // Actions — Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setPickupSlot: (slot: PickupSlotId) => void;
  setPickupBranch: (branchId: string) => void;
  setPickupBranchModalOpen: (open: boolean) => void;

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
  placeOrder: (orderData: { id: string, items: CartItem[], total: number, pickupBranch: string, pickupSlot: PickupSlotId, depositAmount: number }) => void;
  fetchOrders: (userId: string) => Promise<void>;

  // Actions — Inventory
  fetchBranchInventory: (branchId: string) => Promise<void>;
  setBranchInventory: (inventory: Record<number, { stockCount: number; isAvailable: boolean }>) => void;

  // Actions — Branch Reviews
  fetchBranchRatings: () => Promise<void>;
  submitBranchReview: (review: { branchId: string; branchName: string; orderId: string; rating: number; comment?: string }) => Promise<boolean>;

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
      authToken: null,
      isAuthOpen: false,
      cart: [],
      isCartOpen: false,
      pickupSlot: 'asap',
      pickupBranchId: SIMBA_BRANCHES[0].id,
      isPickupBranchModalOpen: false,
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
      branchInventory: {},
      branchRatings: {},
      appliedPromo: null,
      promoDiscount: 0,

      // Auth
      login: (user, authToken) => {
        set((s) => ({
          user,
          authToken,
          isAuthOpen: false,
          // Clear previous user's data when a new user logs in
          orders: [],
          cart: s.user && s.user.id !== user.id ? [] : s.cart,
          favorites: s.user && s.user.id !== user.id ? [] : s.favorites,
          recentlyViewed: s.user && s.user.id !== user.id ? [] : s.recentlyViewed,
          appliedPromo: s.user && s.user.id !== user.id ? null : s.appliedPromo,
          promoDiscount: s.user && s.user.id !== user.id ? 0 : s.promoDiscount,
        }));
      },
      setUser: (user) => set({ user }),
      logout: () => set({
        user: null,
        authToken: null,
        // Clear all user-specific data
        orders: [],
        cart: [],
        favorites: [],
        recentlyViewed: [],
        addresses: DEFAULT_ADDRESSES,
        selectedAddressId: '1',
        appliedPromo: null,
        promoDiscount: 0,
        isCartOpen: false,
        isAuthOpen: false,
        // Go back to home tab
        activeTab: 'home',
      }),
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
      setPickupSlot: (pickupSlot) => set({ pickupSlot }),
      setPickupBranch: (pickupBranchId) => {
        set({ pickupBranchId, isPickupBranchModalOpen: false });
        // Fetch inventory for the newly selected branch
        fetch(`/api/inventory/${pickupBranchId}`)
          .then(r => r.json())
          .then(data => { if (data.ok) set({ branchInventory: data.inventory ?? {} }); })
          .catch(() => {});
      },
      setPickupBranchModalOpen: (isPickupBranchModalOpen) => set({ isPickupBranchModalOpen }),

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
      placeOrder: (orderData) => {
        const order: Order = {
          id: orderData.id,
          date: new Date().toISOString(),
          items: orderData.items,
          total: orderData.total,
          status: 'processing',
          pickupBranch: orderData.pickupBranch,
          pickupSlot: orderData.pickupSlot,
          depositAmount: orderData.depositAmount,
        };

        set((s) => ({ orders: [order, ...s.orders] }));
      },

      fetchOrders: async (userId) => {
        try {
          const res = await fetch(`/api/orders?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            const orders = Array.isArray(data) ? data : data.orders ?? [];
            const formatted = orders.map((o: any) => ({
              ...o,
              date: o.date || o.createdAt || new Date().toISOString()
            }));
            set({ orders: formatted });
          }
        } catch (err) {
          console.error('Failed to fetch orders', err);
        }
      },

      // Inventory
      fetchBranchInventory: async (branchId) => {
        try {
          const res = await fetch(`/api/inventory/${branchId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.inventory) {
              set({ branchInventory: data.inventory });
            }
          }
        } catch (err) {
          console.error('Failed to fetch branch inventory', err);
        }
      },
      setBranchInventory: (inventory) => set({ branchInventory: inventory }),

      // Branch Reviews
      fetchBranchRatings: async () => {
        try {
          const res = await fetch('/api/reviews');
          if (res.ok) {
            const data = await res.json();
            if (data.ok) set({ branchRatings: data.ratings ?? {} });
          }
        } catch { /* silent */ }
      },
      submitBranchReview: async ({ branchId, branchName, orderId, rating, comment }) => {
        try {
          const state = (useSimbaStore.getState() as any);
          const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              branchId,
              branchName,
              userId: state.user?.id ?? null,
              userName: state.user?.name ?? 'Anonymous',
              orderId,
              rating,
              comment: comment ?? null,
            }),
          });
          const data = await res.json();
          if (data.ok) {
            // Refresh ratings
            const ratingsRes = await fetch('/api/reviews');
            const ratingsData = await ratingsRes.json();
            if (ratingsData.ok) set({ branchRatings: ratingsData.ratings ?? {} });
          }
          return data.ok;
        } catch {
          return false;
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
