"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = exports.HybridCacheProvider = exports.RedisCacheProvider = exports.MemoryCacheProvider = exports.CacheProvider = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Abstract cache provider interface
 */
class CacheProvider {
}
exports.CacheProvider = CacheProvider;
/**
 * Memory cache implementation with LRU eviction
 */
class MemoryCacheProvider extends CacheProvider {
    constructor(maxSize = 1000, defaultTtl = 3600) {
        super();
        this.maxSize = maxSize;
        this.defaultTtl = defaultTtl;
        this.cache = new Map();
        this.accessOrder = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            size: 0,
            hitRate: 0
        };
        this.startCleanupTimer();
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }
        // Check if expired
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.stats.misses++;
            this.stats.size = this.cache.size;
            this.updateHitRate();
            return null;
        }
        // Update access order for LRU
        this.accessOrder.set(key, Date.now());
        entry.hits++;
        this.stats.hits++;
        this.updateHitRate();
        return entry.value;
    }
    async set(key, value, ttl) {
        // Ensure we don't exceed max size
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictLeastRecentlyUsed();
        }
        const entry = {
            value,
            timestamp: Date.now(),
            ttl: (ttl || this.defaultTtl) * 1000, // Convert to milliseconds
            hits: 0
        };
        this.cache.set(key, entry);
        this.accessOrder.set(key, Date.now());
        this.stats.sets++;
        this.stats.size = this.cache.size;
    }
    async delete(key) {
        const deleted = this.cache.delete(key);
        this.accessOrder.delete(key);
        if (deleted) {
            this.stats.deletes++;
            this.stats.size = this.cache.size;
        }
        return deleted;
    }
    async clear() {
        this.cache.clear();
        this.accessOrder.clear();
        this.stats.size = 0;
    }
    async has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            this.stats.size = this.cache.size;
            return false;
        }
        return true;
    }
    async getStats() {
        return { ...this.stats };
    }
    async close() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
        this.accessOrder.clear();
    }
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }
    evictLeastRecentlyUsed() {
        if (this.accessOrder.size === 0) {
            return;
        }
        // Find the least recently used key
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, time] of this.accessOrder.entries()) {
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.accessOrder.delete(oldestKey);
            this.stats.evictions++;
            this.stats.size = this.cache.size;
        }
    }
    updateHitRate() {
        const totalRequests = this.stats.hits + this.stats.misses;
        this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    }
    startCleanupTimer() {
        // Clean up expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupExpired();
        }, 5 * 60 * 1000);
    }
    cleanupExpired() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
        }
        this.stats.size = this.cache.size;
    }
}
exports.MemoryCacheProvider = MemoryCacheProvider;
/**
 * Redis cache implementation using ioredis
 * Note: Requires 'ioredis' package to be installed
 */
class RedisCacheProvider extends CacheProvider {
    constructor(config, defaultTtl = 3600) {
        super();
        this.config = config;
        this.defaultTtl = defaultTtl;
        this.client = null;
        this.connected = false;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            size: 0,
            hitRate: 0
        };
        // Don't auto-connect in constructor to avoid blocking
    }
    async ensureConnection() {
        if (this.connected && this.client) {
            return;
        }
        try {
            // Dynamic import to handle optional dependency
            const Redis = await Promise.resolve().then(() => __importStar(require('ioredis'))).catch(() => {
                throw new Error('Redis cache requires ioredis package. Install with: npm install ioredis');
            });
            this.client = new Redis.default(this.config.url, {
                password: this.config.password,
                db: this.config.db || 0,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                retryStrategy: (times) => Math.min(times * 100, 3000)
            });
            await this.client.connect();
            this.connected = true;
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
            throw new Error(`Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async get(key) {
        await this.ensureConnection();
        try {
            const fullKey = this.getFullKey(key);
            const value = await this.client.get(fullKey);
            if (value === null) {
                this.stats.misses++;
                this.updateHitRate();
                return null;
            }
            this.stats.hits++;
            this.updateHitRate();
            return JSON.parse(value);
        }
        catch (error) {
            console.error('Redis get error:', error);
            this.stats.misses++;
            this.updateHitRate();
            return null;
        }
    }
    async set(key, value, ttl) {
        await this.ensureConnection();
        try {
            const fullKey = this.getFullKey(key);
            const serializedValue = JSON.stringify(value);
            const expireTime = ttl || this.defaultTtl;
            await this.client.setex(fullKey, expireTime, serializedValue);
            this.stats.sets++;
        }
        catch (error) {
            console.error('Redis set error:', error);
            throw error;
        }
    }
    async delete(key) {
        await this.ensureConnection();
        try {
            const fullKey = this.getFullKey(key);
            const result = await this.client.del(fullKey);
            if (result > 0) {
                this.stats.deletes++;
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Redis delete error:', error);
            return false;
        }
    }
    async clear() {
        await this.ensureConnection();
        try {
            const pattern = this.getFullKey('*');
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        }
        catch (error) {
            console.error('Redis clear error:', error);
            throw error;
        }
    }
    async has(key) {
        await this.ensureConnection();
        try {
            const fullKey = this.getFullKey(key);
            const exists = await this.client.exists(fullKey);
            return exists > 0;
        }
        catch (error) {
            console.error('Redis has error:', error);
            return false;
        }
    }
    async getStats() {
        return { ...this.stats };
    }
    async close() {
        if (this.client && this.connected) {
            await this.client.quit();
            this.connected = false;
        }
    }
    getFullKey(key) {
        const prefix = this.config.keyPrefix || 'macro_api';
        return `${prefix}:${key}`;
    }
    updateHitRate() {
        const totalRequests = this.stats.hits + this.stats.misses;
        this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    }
}
exports.RedisCacheProvider = RedisCacheProvider;
/**
 * Hybrid cache provider (Memory + Redis)
 */
class HybridCacheProvider extends CacheProvider {
    constructor(memoryMaxSize, redisConfig, defaultTtl = 3600) {
        super();
        this.l1Cache = new MemoryCacheProvider(memoryMaxSize, defaultTtl);
        this.l2Cache = new RedisCacheProvider(redisConfig, defaultTtl);
    }
    async get(key) {
        // Try L1 cache first
        let value = await this.l1Cache.get(key);
        if (value !== null) {
            return value;
        }
        // Try L2 cache
        try {
            value = await this.l2Cache.get(key);
            if (value !== null) {
                // Promote to L1 cache
                await this.l1Cache.set(key, value);
                return value;
            }
        }
        catch (error) {
            console.warn('L2 cache error, falling back to L1 only:', error);
        }
        return null;
    }
    async set(key, value, ttl) {
        // Set in L1 cache first (always succeeds)
        await this.l1Cache.set(key, value, ttl);
        // Try to set in L2 cache (may fail)
        try {
            await this.l2Cache.set(key, value, ttl);
        }
        catch (error) {
            console.warn('L2 cache set failed, continuing with L1 only:', error);
        }
    }
    async delete(key) {
        const l1Result = await this.l1Cache.delete(key);
        let l2Result = false;
        try {
            l2Result = await this.l2Cache.delete(key);
        }
        catch (error) {
            console.warn('L2 cache delete failed:', error);
        }
        return l1Result || l2Result;
    }
    async clear() {
        await this.l1Cache.clear();
        try {
            await this.l2Cache.clear();
        }
        catch (error) {
            console.warn('L2 cache clear failed:', error);
        }
    }
    async has(key) {
        // Check L1 first
        const l1Has = await this.l1Cache.has(key);
        if (l1Has) {
            return true;
        }
        // Check L2
        try {
            return await this.l2Cache.has(key);
        }
        catch (error) {
            console.warn('L2 cache has check failed:', error);
            return false;
        }
    }
    async getStats() {
        const l1Stats = await this.l1Cache.getStats();
        let l2Stats;
        try {
            l2Stats = await this.l2Cache.getStats();
        }
        catch (error) {
            console.warn('L2 cache stats failed:', error);
            l2Stats = {
                hits: 0,
                misses: 0,
                sets: 0,
                deletes: 0,
                evictions: 0,
                size: 0,
                hitRate: 0
            };
        }
        return {
            hits: l1Stats.hits + l2Stats.hits,
            misses: l1Stats.misses + l2Stats.misses,
            sets: l1Stats.sets + l2Stats.sets,
            deletes: l1Stats.deletes + l2Stats.deletes,
            evictions: l1Stats.evictions + l2Stats.evictions,
            size: l1Stats.size + l2Stats.size,
            hitRate: (l1Stats.hits + l2Stats.hits) / (l1Stats.hits + l1Stats.misses + l2Stats.hits + l2Stats.misses) || 0
        };
    }
    async close() {
        await Promise.all([
            this.l1Cache.close(),
            this.l2Cache.close().catch(error => {
                console.warn('L2 cache close failed:', error);
            })
        ]);
    }
}
exports.HybridCacheProvider = HybridCacheProvider;
/**
 * Main cache manager
 */
class CacheManager {
    constructor(config) {
        this.provider = this.createProvider(config);
    }
    createProvider(config) {
        switch (config.type) {
            case 'memory':
                return new MemoryCacheProvider(config.maxSize, config.ttl);
            case 'redis':
                if (!config.redis) {
                    throw new Error('Redis configuration is required for redis cache type');
                }
                return new RedisCacheProvider(config.redis, config.ttl);
            case 'hybrid':
                if (!config.redis) {
                    throw new Error('Redis configuration is required for hybrid cache type');
                }
                return new HybridCacheProvider(config.maxSize || 1000, config.redis, config.ttl);
            default:
                throw new Error(`Unsupported cache type: ${config.type}`);
        }
    }
    /**
     * Generate cache key to avoid collisions
     */
    generateKey(service, method, params) {
        const paramHash = crypto_1.default
            .createHash('md5')
            .update(JSON.stringify(params, Object.keys(params).sort()))
            .digest('hex')
            .substring(0, 8);
        return `macro_api:${service}:${method}:${paramHash}`;
    }
    /**
     * Get value from cache
     */
    async get(key) {
        return this.provider.get(key);
    }
    /**
     * Set value in cache
     */
    async set(key, value, ttl) {
        return this.provider.set(key, value, ttl);
    }
    /**
     * Delete value from cache
     */
    async delete(key) {
        return this.provider.delete(key);
    }
    /**
     * Clear all cache entries
     */
    async clear() {
        return this.provider.clear();
    }
    /**
     * Check if key exists in cache
     */
    async has(key) {
        return this.provider.has(key);
    }
    /**
     * Get cache statistics
     */
    async getStats() {
        return this.provider.getStats();
    }
    /**
     * Close cache connections
     */
    async close() {
        return this.provider.close();
    }
    /**
     * Wrap a function with caching
     */
    async cached(key, fn, ttl) {
        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        // Execute function and cache result
        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }
    /**
     * Memoize a function with caching
     */
    memoize(fn, keyGenerator, ttl) {
        return async (...args) => {
            const key = keyGenerator(...args);
            return this.cached(key, () => fn(...args), ttl);
        };
    }
    /**
     * Invalidate cache entries by pattern
     */
    async invalidatePattern(pattern) {
        // This is a simplified implementation
        // In production, you'd want pattern-based invalidation
        let count = 0;
        if (pattern.includes('*')) {
            // For now, we can only clear all
            await this.clear();
            count = 1; // Approximate
        }
        return count;
    }
    /**
     * Warm up cache with data
     */
    async warmUp(entries) {
        const promises = entries.map(entry => this.set(entry.key, entry.value, entry.ttl));
        await Promise.all(promises);
    }
}
exports.CacheManager = CacheManager;
