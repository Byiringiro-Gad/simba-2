'use client';

import { useState, useEffect, useRef } from 'react';
import { getSimbaData } from '@/lib/data';
import type { Product } from '@/types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cachedProducts: Product[] | null = null;
let cacheTime = 0;

/**
 * Returns the product catalog, merging static JSON with live DB overrides/additions.
 *
 * - Immediately returns static data (zero flash / layout shift)
 * - Fetches /api/products in the background
 * - Replaces static data with live data once fetched
 * - Caches the live result for 5 minutes to avoid repeated network calls
 */
export function useLiveProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(
    () => getSimbaData().products
  );
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // Use in-memory cache to avoid redundant fetches across re-renders
    if (cachedProducts && Date.now() - cacheTime < CACHE_TTL) {
      setProducts(cachedProducts);
      return;
    }

    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (data.ok && Array.isArray(data.products) && data.products.length > 0) {
          cachedProducts = data.products;
          cacheTime = Date.now();
          setProducts(data.products);
        }
      })
      .catch(() => {
        // API unavailable — static data already showing, nothing to do
      });
  }, []);

  return products;
}
