import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Language } from '@/types';

interface CartItem extends Product {
  quantity: number;
}

interface SimbaState {
  cart: CartItem[];
  language: Language;
  isDarkMode: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  selectedHub: string;
  isCartOpen: boolean;
  
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedHub: (hub: string) => void;
  setCartOpen: (isOpen: boolean) => void;
}

export const useSimbaStore = create<SimbaState>()(
  persist(
    (set) => ({
      cart: [],
      language: 'en',
      isDarkMode: false,
      searchQuery: '',
      selectedCategory: null,
      selectedHub: 'supermarket',
      isCartOpen: false,

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item => 
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item => 
          item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ).filter(item => item.quantity > 0)
      })),

      clearCart: () => set({ cart: [] }),
      setLanguage: (language) => set({ language }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedHub: (selectedHub) => set({ selectedHub, selectedCategory: null }),
      setCartOpen: (isCartOpen) => set({ isCartOpen }),
    }),
    {
      name: 'simba-storage',
    }
  )
);
