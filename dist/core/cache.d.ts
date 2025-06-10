export interface CacheConfig {
    type: 'memory' | 'redis' | 'hybrid';
    ttl: number;
    maxSize?: number;
    redis?: {
        url: string;
        keyPrefix?: string;
        cluster?: boolean;
        password?: string;
        db?: number;
    };
    compression?: boolean;
    serialization?: 'json' | 'msgpack';
}
export interface CacheEntry<T = any> {
    value: T;
    timestamp: number;
    ttl: number;
    hits: number;
}
export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    evictions: number;
    size: number;
    hitRate: number;
}
/**
 * Abstract cache provider interface
 */
export declare abstract class CacheProvider {
    abstract get<T>(key: string): Promise<T | null>;
    abstract set<T>(key: string, value: T, ttl?: number): Promise<void>;
    abstract delete(key: string): Promise<boolean>;
    abstract clear(): Promise<void>;
    abstract has(key: string): Promise<boolean>;
    abstract getStats(): Promise<CacheStats>;
    abstract close(): Promise<void>;
}
/**
 * Memory cache implementation with LRU eviction
 */
export declare class MemoryCacheProvider extends CacheProvider {
    private readonly maxSize;
    private readonly defaultTtl;
    private cache;
    private accessOrder;
    private stats;
    private cleanupInterval?;
    constructor(maxSize?: number, defaultTtl?: number);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    getStats(): Promise<CacheStats>;
    close(): Promise<void>;
    private isExpired;
    private evictLeastRecentlyUsed;
    private updateHitRate;
    private startCleanupTimer;
    private cleanupExpired;
}
/**
 * Redis cache implementation using ioredis
 * Note: Requires 'ioredis' package to be installed
 */
export declare class RedisCacheProvider extends CacheProvider {
    private readonly config;
    private readonly defaultTtl;
    private client;
    private connected;
    private stats;
    constructor(config: NonNullable<CacheConfig['redis']>, defaultTtl?: number);
    private ensureConnection;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    getStats(): Promise<CacheStats>;
    close(): Promise<void>;
    private getFullKey;
    private updateHitRate;
}
/**
 * Hybrid cache provider (Memory + Redis)
 */
export declare class HybridCacheProvider extends CacheProvider {
    private l1Cache;
    private l2Cache;
    constructor(memoryMaxSize: number, redisConfig: NonNullable<CacheConfig['redis']>, defaultTtl?: number);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<boolean>;
    clear(): Promise<void>;
    has(key: string): Promise<boolean>;
    getStats(): Promise<CacheStats>;
    close(): Promise<void>;
}
/**
 * Main cache manager
 */
export declare class CacheManager {
    private provider;
    constructor(config: CacheConfig);
    private createProvider;
    /**
     * Generate cache key to avoid collisions
     */
    generateKey(service: string, method: string, params: object): string;
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete value from cache
     */
    delete(key: string): Promise<boolean>;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Check if key exists in cache
     */
    has(key: string): Promise<boolean>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<CacheStats>;
    /**
     * Close cache connections
     */
    close(): Promise<void>;
    /**
     * Wrap a function with caching
     */
    cached<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
    /**
     * Memoize a function with caching
     */
    memoize<TArgs extends any[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, keyGenerator: (...args: TArgs) => string, ttl?: number): (...args: TArgs) => Promise<TReturn>;
    /**
     * Invalidate cache entries by pattern
     */
    invalidatePattern(pattern: string): Promise<number>;
    /**
     * Warm up cache with data
     */
    warmUp<T>(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>): Promise<void>;
}
