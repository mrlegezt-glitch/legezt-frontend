import { useState, useEffect } from "react";

/**
 * A Least Recently Used (LRU) Cache with a strict space complexity limit.
 * Lookup / GET: O(1) time complexity
 * Insertion / PUT: O(1) time complexity
 * Space Complexity: O(K) where K is the maximum capacity
 */
export class SpaceBoundedLRUCache<K, V> {
  private cache = new Map<K, V>();
  private capacity: number;

  constructor(capacity: number = 20) {
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    // Refresh item: remove and append to the end to mark as most recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict Least Recently Used item (first entry in Map insertion order)
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Greedy Prefetcher uses an Intersection Observer to eagerly prefetch data/pages
 * in the background when they enter or approach the viewport.
 * Fetched items are cached in the SpaceBoundedLRUCache to avoid memory bloat.
 */
export class GreedyPrefetcher {
  private cache: SpaceBoundedLRUCache<string, any>;
  private observer: IntersectionObserver | null = null;
  private prefetchedUrls = new Set<string>();

  constructor(capacity: number = 25) {
    this.cache = new SpaceBoundedLRUCache(capacity);
    if (typeof window !== "undefined") {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const url = entry.target.getAttribute("data-prefetch-url");
              if (url) {
                this.prefetch(url);
              }
            }
          });
        },
        { rootMargin: "50px" } // Pre-trigger slightly before entry
      );
    }
  }

  observe(element: HTMLElement, url: string): void {
    if (!this.observer) return;
    element.setAttribute("data-prefetch-url", url);
    this.observer.observe(element);
  }

  unobserve(element: HTMLElement): void {
    if (!this.observer) return;
    this.observer.unobserve(element);
  }

  async prefetch(url: string): Promise<any> {
    if (this.prefetchedUrls.has(url)) {
      return this.cache.get(url);
    }
    this.prefetchedUrls.add(url);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        this.cache.put(url, data);
        return data;
      }
    } catch (err) {
      console.error(`[GreedyPrefetcher] Error prefetching: ${url}`, err);
      this.prefetchedUrls.delete(url); // allow retrying on error
    }
    return null;
  }

  getCachedData(url: string): any | undefined {
    return this.cache.get(url);
  }
}

export const globalPrefetcher = typeof window !== "undefined" ? new GreedyPrefetcher() : null;

/**
 * A custom React hook for Optimistic UI updates.
 * Updates UI state instantly (greedily) and rolls back to rollbackState if the operation fails.
 */
export function useOptimisticAction<T>(
  initialState: T,
  actionFn: (payload: any) => Promise<T>
) {
  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState(false);

  const execute = async (
    payload: any,
    getOptimisticState: (currentState: T, payload: any) => T
  ) => {
    const rollbackState = state;
    // Apply optimistic updates greedily
    const optimistic = getOptimisticState(state, payload);
    setState(optimistic);
    setIsPending(true);

    try {
      const result = await actionFn(payload);
      setState(result);
    } catch (error) {
      console.error("[useOptimisticAction] Action failed. Rolling back...", error);
      setState(rollbackState);
    } finally {
      setIsPending(false);
    }
  };

  return [state, execute, isPending] as const;
}

/**
 * A custom React hook to debounce any value update.
 * Extremely useful to avoid UI lag during rapid keypress/search filtering.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
