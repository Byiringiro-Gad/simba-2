import { Review } from '@/types';

// In-memory review store — persisted via localStorage
const STORAGE_KEY = 'simba-reviews';

function load(): Review[] {
  if (typeof window === 'undefined') return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED_REVIEWS;
  } catch { return SEED_REVIEWS; }
}

function save(reviews: Review[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

// Seed reviews for a few products
const SEED_REVIEWS: Review[] = [
  { id: 'r1', productId: 61001, userId: 'u1', userName: 'Amina K.', rating: 5, comment: 'Fresh every morning, exactly as described!', date: '2026-04-10', verified: true },
  { id: 'r2', productId: 61001, userId: 'u2', userName: 'Jean P.', rating: 4, comment: 'Good quality, fast delivery.', date: '2026-04-08', verified: true },
  { id: 'r3', productId: 27001, userId: 'u3', userName: 'Claire M.', rating: 5, comment: 'Excellent product, well packaged.', date: '2026-04-05', verified: false },
  { id: 'r4', productId: 16001, userId: 'u4', userName: 'Patrick N.', rating: 4, comment: 'My kids love it!', date: '2026-04-01', verified: true },
];

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
    // Deterministic fake rating based on product ID
    const avg = 3.5 + (productId % 15) / 10;
    const count = 3 + (productId % 47);
    return { avg: Math.min(5, parseFloat(avg.toFixed(1))), count };
  }
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  return { avg: parseFloat(avg.toFixed(1)), count: reviews.length };
}

// Deterministic low-stock count for urgency (not random — stable per product)
export function getStockCount(productId: number): number | null {
  const n = productId % 20;
  if (n <= 3) return n + 1;   // 1-4 left — show urgency
  if (n <= 6) return null;     // show nothing (plenty)
  return null;
}
