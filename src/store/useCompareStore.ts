import { create } from 'zustand';
import { Product } from '@/types';

interface CompareState {
  compareList: Product[];
  isCompareOpen: boolean;

  addToCompare: (product: Product) => boolean; // returns false if already 3 items
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
  setCompareOpen: (open: boolean) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareList: [],
  isCompareOpen: false,

  addToCompare: (product) => {
    const { compareList } = get();
    if (compareList.length >= 3) return false;
    if (compareList.find(p => p.id === product.id)) return true;
    set({ compareList: [...compareList, product] });
    return true;
  },

  removeFromCompare: (productId) => {
    set(s => ({
      compareList: s.compareList.filter(p => p.id !== productId),
      isCompareOpen: s.compareList.length <= 1 ? false : s.isCompareOpen,
    }));
  },

  clearCompare: () => set({ compareList: [], isCompareOpen: false }),

  isInCompare: (productId) => get().compareList.some(p => p.id === productId),

  setCompareOpen: (open) => set({ isCompareOpen: open }),
}));
