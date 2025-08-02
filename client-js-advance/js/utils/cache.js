/**
 * Advanced Cache System
 * Implements memory and storage caching with TTL and size limits
 */

class CacheManager {
    constructor(options = {}) {
        this.enabled = options.enabled ?? AppConfig.cache.enabled;
        this.ttl = options.ttl ?? AppConfig.cache.ttl;
        this.maxSize = options.maxSize ?? AppConfig.cache.maxSize;
        this.prefix = options.prefix ?? AppConfig.cache.prefix;
        
        this.memoryCache = new Map();
        this.logger = logger.child('Cache');
        
        // Cleanup expired entries periodically
        if (this.enabled) {
            setInterval(() => this.cleanup(), 60000); // Every minute
        }
    }

    /**
     * Generate cache key
     */
    _generateKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Create cache entry
     */
    _createEntry(data, customTTL = null) {
        return {
            data: Utils.deepClone(data),
            timestamp: Date.now(),
            ttl: customTTL ?? this.ttl,
            accessCount: 0,
            lastAccessed: Date.now()
        };
    }

    /**
     * Check if entry is expired
     */
    _isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }

    /**
     * Set item in cache
     */
    set(key, data, options = {}) {
        if (!this.enabled) return;

        const cacheKey = this._generateKey(key);
        const entry = this._createEntry(data, options.ttl);

        try {
            // Memory cache
            this.memoryCache.set(cacheKey, entry);

            // Storage cache (if enabled and supported)
            if (options.persist !== false && this._isStorageAvailable()) {
                localStorage.setItem(cacheKey, JSON.stringify(entry));
            }

            // Enforce size limit
            this._enforceSize();

            this.logger.debug(`Cache set: ${key}`, { 
                size: this.memoryCache.size,
                ttl: entry.ttl 
            });

        } catch (error) {
            this.logger.error(`Failed to cache item: ${key}`, error);
        }
    }

    /**
     * Get item from cache
     */
    get(key, options = {}) {
        if (!this.enabled) return null;

        const cacheKey = this._generateKey(key);

        try {
            // Try memory cache first
            let entry = this.memoryCache.get(cacheKey);

            // If not in memory, try storage
            if (!entry && this._isStorageAvailable()) {
                const stored = localStorage.getItem(cacheKey);
                if (stored) {
                    entry = JSON.parse(stored);
                    // Restore to memory cache
                    this.memoryCache.set(cacheKey, entry);
                }
            }

            if (!entry) {
                this.logger.debug(`Cache miss: ${key}`);
                return null;
            }

            // Check expiration
            if (this._isExpired(entry)) {
                this.delete(key);
                this.logger.debug(`Cache expired: ${key}`);
                return null;
            }

            // Update access info
            entry.accessCount++;
            entry.lastAccessed = Date.now();

            this.logger.debug(`Cache hit: ${key}`, { 
                accessCount: entry.accessCount,
                age: Date.now() - entry.timestamp 
            });

            return options.clone !== false ? Utils.deepClone(entry.data) : entry.data;

        } catch (error) {
            this.logger.error(`Failed to get cached item: ${key}`, error);
            return null;
        }
    }

    /**
     * Delete item from cache
     */
    delete(key) {
        if (!this.enabled) return;

        const cacheKey = this._generateKey(key);

        try {
            // Remove from memory
            const deleted = this.memoryCache.delete(cacheKey);

            // Remove from storage
            if (this._isStorageAvailable()) {
                localStorage.removeItem(cacheKey);
            }

            if (deleted) {
                this.logger.debug(`Cache deleted: ${key}`);
            }

            return deleted;
        } catch (error) {
            this.logger.error(`Failed to delete cached item: ${key}`, error);
            return false;
        }
    }

    /**
     * Check if item exists in cache
     */
    has(key) {
        if (!this.enabled) return false;

        const item = this.get(key, { clone: false });
        return item !== null;
    }

    /**
     * Clear all cache
     */
    clear() {
        if (!this.enabled) return;

        try {
            // Clear memory cache
            this.memoryCache.clear();

            // Clear storage cache
            if (this._isStorageAvailable()) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            }

            this.logger.info('Cache cleared');
        } catch (error) {
            this.logger.error('Failed to clear cache', error);
        }
    }

    /**
     * Get or set with factory function
     */
    async getOrSet(key, factory, options = {}) {
        if (!this.enabled) {
            return await factory();
        }

        // Try to get from cache first
        let data = this.get(key, options);
        
        if (data !== null) {
            return data;
        }

        // Not in cache, use factory to get data
        try {
            data = await factory();
            
            // Cache the result
            if (data !== null && data !== undefined) {
                this.set(key, data, options);
            }
            
            return data;
        } catch (error) {
            this.logger.error(`Factory function failed for key: ${key}`, error);
            throw error;
        }
    }

    /**
     * Cleanup expired entries
     */
    cleanup() {
        if (!this.enabled) return;

        let removedCount = 0;

        try {
            // Cleanup memory cache
            for (const [key, entry] of this.memoryCache.entries()) {
                if (this._isExpired(entry)) {
                    this.memoryCache.delete(key);
                    removedCount++;
                }
            }

            // Cleanup storage cache
            if (this._isStorageAvailable()) {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        try {
                            const stored = localStorage.getItem(key);
                            if (stored) {
                                const entry = JSON.parse(stored);
                                if (this._isExpired(entry)) {
                                    localStorage.removeItem(key);
                                    removedCount++;
                                }
                            }
                        } catch {
                            // Remove invalid entries
                            localStorage.removeItem(key);
                            removedCount++;
                        }
                    }
                });
            }

            if (removedCount > 0) {
                this.logger.debug(`Cache cleanup: ${removedCount} expired entries removed`);
            }

        } catch (error) {
            this.logger.error('Cache cleanup failed', error);
        }
    }

    /**
     * Enforce cache size limit
     */
    _enforceSize() {
        if (this.memoryCache.size <= this.maxSize) return;

        // Sort by last accessed time (LRU)
        const entries = Array.from(this.memoryCache.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

        // Remove oldest entries
        const removeCount = this.memoryCache.size - this.maxSize;
        for (let i = 0; i < removeCount; i++) {
            const [key] = entries[i];
            this.memoryCache.delete(key);
            
            // Also remove from storage
            if (this._isStorageAvailable()) {
                localStorage.removeItem(key);
            }
        }

        this.logger.debug(`Cache size enforced: ${removeCount} entries removed`);
    }

    /**
     * Check if localStorage is available
     */
    _isStorageAvailable() {
        try {
            const test = '__cache_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const memorySize = this.memoryCache.size;
        let storageSize = 0;

        if (this._isStorageAvailable()) {
            const keys = Object.keys(localStorage);
            storageSize = keys.filter(key => key.startsWith(this.prefix)).length;
        }

        return {
            enabled: this.enabled,
            memorySize,
            storageSize,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }

    /**
     * Get all cache keys
     */
    getKeys() {
        const keys = Array.from(this.memoryCache.keys())
            .map(key => key.replace(this.prefix, ''));
        
        return keys;
    }

    /**
     * Invalidate cache by pattern
     */
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        let removedCount = 0;

        // Remove from memory cache
        for (const [key] of this.memoryCache.entries()) {
            const cleanKey = key.replace(this.prefix, '');
            if (regex.test(cleanKey)) {
                this.memoryCache.delete(key);
                removedCount++;
            }
        }

        // Remove from storage cache
        if (this._isStorageAvailable()) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.replace(this.prefix, '');
                    if (regex.test(cleanKey)) {
                        localStorage.removeItem(key);
                        removedCount++;
                    }
                }
            });
        }

        this.logger.debug(`Pattern invalidation: ${removedCount} entries removed for pattern: ${pattern}`);
        return removedCount;
    }
}

// Create global cache instance
const cache = new CacheManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CacheManager, cache };
} else {
    window.CacheManager = CacheManager;
    window.cache = cache;
}