/**
 * Cache service for API responses and heavy computations
 * Implements memory cache with TTL and localStorage fallback
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private memoryCache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly STORAGE_PREFIX = 'spooky_cache_';

  /**
   * Get item from cache (memory first, then localStorage)
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && this.isValid(memoryItem)) {
      return memoryItem.data;
    }

    // Check localStorage cache
    try {
      const storageItem = localStorage.getItem(this.STORAGE_PREFIX + key);
      if (storageItem) {
        const parsed: CacheItem<T> = JSON.parse(storageItem);
        if (this.isValid(parsed)) {
          // Restore to memory cache
          this.memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          // Remove expired item
          localStorage.removeItem(this.STORAGE_PREFIX + key);
        }
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  /**
   * Set item in cache (both memory and localStorage)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Store in memory
    this.memoryCache.set(key, item);

    // Store in localStorage for persistence
    try {
      localStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Cache write error:', error);
      // If localStorage is full, try to clear old items
      this.clearExpired();
    }
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.STORAGE_PREFIX + key);
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Clear expired items from cache
   */
  clearExpired(): void {
    // Clear expired memory cache items
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear expired localStorage items
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '');
            if (!this.isValid(item)) {
              localStorage.removeItem(key);
            }
          } catch {
            // Remove invalid items
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  /**
   * Check if cache item is still valid
   */
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memoryItems: this.memoryCache.size,
      storageItems: Object.keys(localStorage).filter(key => 
        key.startsWith(this.STORAGE_PREFIX)
      ).length
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Auto-cleanup expired items every 10 minutes
setInterval(() => {
  cacheService.clearExpired();
}, 10 * 60 * 1000);