/**
 * Advanced Cache Manager
 * In-memory and persistent storage with TTL and size limits
 */

import type { CacheEntry, CacheStats, CacheOptions } from '@/types';
import config from '@/config/app.config';
import { logger } from './logger';
import { deepClone } from './helpers';

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly maxSize: number;
  private readonly defaultTtl: number;
  private readonly prefix: string;
  private readonly enabled: boolean;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.maxSize = config.cache.maxSize;
    this.defaultTtl = config.cache.ttl;
    this.prefix = config.cache.prefix;
    this.enabled = config.cache.enabled;

    if (this.enabled) {
      this.startCleanupInterval();
      this.loadFromStorage();
    }
  }

  /**
   * Store data in cache
   */
  set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): void {
    if (!this.enabled) {
      return;
    }

    try {
      const ttl = options.ttl ?? this.defaultTtl;
      const now = Date.now();
      
      const entry: CacheEntry<T> = {
        data: deepClone(data),
        timestamp: now,
        ttl,
        accessCount: 1,
        lastAccessed: now
      };

      // Check if we need to make space
      if (this.memoryCache.size >= this.maxSize) {
        this.evictLeastRecentlyUsed();
      }

      const cacheKey = this.getCacheKey(key);
      this.memoryCache.set(cacheKey, entry);

      // Persist to storage if enabled
      if (options.persist !== false) {
        this.persistToStorage(cacheKey, entry);
      }

      logger.debug('Cache entry stored', { key, ttl, dataSize: JSON.stringify(data).length });
    } catch (error) {
      logger.error('Error storing cache entry', { key, error });
    }
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null {
    if (!this.enabled) {
      return null;
    }

    try {
      const cacheKey = this.getCacheKey(key);
      const entry = this.memoryCache.get(cacheKey) as CacheEntry<T> | undefined;

      if (!entry) {
        // Try to load from storage
        const storedEntry = this.loadFromStorageByKey<T>(cacheKey);
        if (storedEntry) {
          this.memoryCache.set(cacheKey, storedEntry);
          return this.handleCacheHit(storedEntry);
        }
        
        logger.debug('Cache miss', { key });
        return null;
      }

      // Check if entry is expired
      if (this.isExpired(entry)) {
        this.delete(key);
        logger.debug('Cache entry expired', { key });
        return null;
      }

      return this.handleCacheHit(entry);
    } catch (error) {
      logger.error('Error retrieving cache entry', { key, error });
      return null;
    }
  }

  /**
   * Handle cache hit - update access statistics and return data
   */
  private handleCacheHit<T>(entry: CacheEntry<T>): T {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    logger.debug('Cache hit', { 
      accessCount: entry.accessCount,
      age: Date.now() - entry.timestamp 
    });

    return deepClone(entry.data);
  }

  /**
   * Check if entry has expired
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return (now - entry.timestamp) > entry.ttl;
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    if (!this.enabled) {
      return false;
    }

    const cacheKey = this.getCacheKey(key);
    const deleted = this.memoryCache.delete(cacheKey);
    
    if (deleted) {
      this.removeFromStorage(cacheKey);
      logger.debug('Cache entry deleted', { key });
    }

    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    if (!this.enabled) {
      return false;
    }

    const cacheKey = this.getCacheKey(key);
    const entry = this.memoryCache.get(cacheKey);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    this.clearStorage();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const memoryEntries = Array.from(this.memoryCache.values());
    const memorySize = memoryEntries.reduce((total, entry) => {
      return total + JSON.stringify(entry.data).length;
    }, 0);

    const storageSize = this.getStorageSize();

    return {
      enabled: this.enabled,
      memorySize,
      storageSize,
      maxSize: this.maxSize,
      ttl: this.defaultTtl
    };
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    if (!this.enabled) {
      return [];
    }

    return Array.from(this.memoryCache.keys())
      .map(key => key.replace(this.prefix, ''));
  }

  /**
   * Get cache entries by pattern
   */
  getByPattern(pattern: RegExp): Array<{ key: string; data: any; entry: CacheEntry<any> }> {
    if (!this.enabled) {
      return [];
    }

    const results: Array<{ key: string; data: any; entry: CacheEntry<any> }> = [];

    this.memoryCache.forEach((entry, cacheKey) => {
      const key = cacheKey.replace(this.prefix, '');
      
      if (pattern.test(key) && !this.isExpired(entry)) {
        results.push({
          key,
          data: deepClone(entry.data),
          entry: { ...entry }
        });
      }
    });

    return results;
  }

  /**
   * Update TTL for existing entry
   */
  updateTtl(key: string, newTtl: number): boolean {
    if (!this.enabled) {
      return false;
    }

    const cacheKey = this.getCacheKey(key);
    const entry = this.memoryCache.get(cacheKey);

    if (!entry || this.isExpired(entry)) {
      return false;
    }

    entry.ttl = newTtl;
    entry.timestamp = Date.now(); // Reset timestamp
    
    this.persistToStorage(cacheKey, entry);
    logger.debug('Cache TTL updated', { key, newTtl });

    return true;
  }

  /**
   * Refresh cache entry (reset timestamp without changing data)
   */
  refresh(key: string): boolean {
    return this.updateTtl(key, this.defaultTtl);
  }

  /**
   * Get cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Evict least recently used entry
   */
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    this.memoryCache.forEach((entry, key) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      const originalKey = oldestKey.replace(this.prefix, '');
      this.delete(originalKey);
      logger.debug('Cache entry evicted (LRU)', { key: originalKey });
    }
  }

  /**
   * Start cleanup interval to remove expired entries
   */
  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Remove expired entries
   */
  private cleanupExpired(): void {
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.memoryCache.delete(key);
      this.removeFromStorage(key);
    });

    if (expiredKeys.length > 0) {
      logger.debug('Expired cache entries cleaned up', { count: expiredKeys.length });
    }
  }

  /**
   * Persist entry to localStorage
   */
  private persistToStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      const serialized = JSON.stringify(entry);
      localStorage.setItem(key, serialized);
    } catch (error) {
      // Storage might be full or disabled
      logger.warn('Failed to persist cache to storage', { key, error });
    }
  }

  /**
   * Load entry from localStorage
   */
  private loadFromStorageByKey<T>(key: string): CacheEntry<T> | null {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        return null;
      }

      const entry = JSON.parse(serialized) as CacheEntry<T>;
      
      // Check if expired
      if (this.isExpired(entry)) {
        this.removeFromStorage(key);
        return null;
      }

      return entry;
    } catch (error) {
      logger.warn('Failed to load cache from storage', { key, error });
      this.removeFromStorage(key);
      return null;
    }
  }

  /**
   * Load all entries from localStorage
   */
  private loadFromStorage(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(this.prefix)) {
          const entry = this.loadFromStorageByKey(key);
          if (entry && this.memoryCache.size < this.maxSize) {
            this.memoryCache.set(key, entry);
          }
        }
      }

      logger.debug('Cache loaded from storage', { 
        entriesLoaded: this.memoryCache.size 
      });
    } catch (error) {
      logger.error('Error loading cache from storage', { error });
    }
  }

  /**
   * Remove entry from localStorage
   */
  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.warn('Failed to remove cache from storage', { key, error });
    }
  }

  /**
   * Clear all cache entries from localStorage
   */
  private clearStorage(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      logger.debug('Cache storage cleared', { keysRemoved: keysToRemove.length });
    } catch (error) {
      logger.error('Error clearing cache storage', { error });
    }
  }

  /**
   * Get total size of cache in localStorage
   */
  private getStorageSize(): number {
    let totalSize = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      }
    } catch (error) {
      logger.warn('Error calculating storage size', { error });
    }

    return totalSize;
  }

  /**
   * Destroy cache manager and cleanup resources
   */
  destroy(): void {
    this.stopCleanupInterval();
    this.clear();
    logger.info('Cache manager destroyed');
  }
}

// Create and export default cache instance
export const cache = new CacheManager();

/**
 * Cache decorator for methods
 */
export const cached = (ttl?: number, keyGenerator?: (...args: any[]) => string) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const key = keyGenerator ? 
        keyGenerator(...args) : 
        `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;

      // Try to get from cache first
      const cached = cache.get(key);
      if (cached !== null) {
        logger.debug('Method result served from cache', { method: propertyName, key });
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(key, result, { ttl });

      logger.debug('Method result cached', { method: propertyName, key });
      return result;
    };
  };
};

/**
 * Invalidate cache by pattern
 */
export const invalidateCache = (pattern: string | RegExp): void => {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  const entries = cache.getByPattern(regex);
  
  entries.forEach(({ key }) => {
    cache.delete(key);
  });

  logger.debug('Cache invalidated by pattern', { pattern: pattern.toString(), count: entries.length });
};

/**
 * Memoization utility
 */
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  ttl?: number,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const memoizedFn = (...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? 
      keyGenerator(...args) : 
      `memoized.${fn.name}.${JSON.stringify(args)}`;

    const cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result, { ttl });

    return result;
  };

  return memoizedFn as T;
};

export default cache;