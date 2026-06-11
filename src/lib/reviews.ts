import { Review } from '@/types';

// In-memory review store — persisted via localStorage
const STORAGE_KEY = 'simba-reviews';

function load(): Review[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(reviews: Review[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getReviews(productId: number): Review[] {
  return load().filter(r => r.productId === productId);
}

export function addReview(review: Omit<Review, 'id' | 'date'>): Review {
  const all = load();
  const newReview: Review = {
    ...review,
    id: `r${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
  };
  const updated = [newReview, ...all];
  save(updated);
  return newReview;
}

export function getProductRating(productId: number): { avg: number; count: number } {
  const reviews = getReviews(productId);
  if (reviews.length === 0) {
    return { avg: 0, count: 0 }; // no reviews — show empty stars
  }
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  return { avg: parseFloat(avg.toFixed(1)), count: reviews.length };
}

// No fake urgency — always return null
export function getStockCount(_productId: number): number | null {
  return null;
}
