import crypto from 'crypto';

export interface CacheConfig {
  type: 'memory' | 'redis' | 'hybrid';
  ttl: number; // Time to live in seconds
  maxSize?: number; // Memory cache size limit
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

export interface CacheEntry<T = unknown> {
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
export abstract class CacheProvider {
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
export class MemoryCacheProvider extends CacheProvider {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  };
  private cleanupInterval?: NodeJS.Timeout;
  
  constructor(
    private readonly maxSize: number = 1000,
    private readonly defaultTtl: number = 3600
  ) {
    super();
    this.startCleanupTimer();
  }

  async get<T>(key: string): Promise<T | null> {
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
    
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Ensure we don't exceed max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed();
    }

    const entry: CacheEntry<T> = {
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

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
    }
    
    return deleted;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats.size = 0;
  }

  async has(key: string): Promise<boolean> {
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

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.accessOrder.clear();
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLeastRecentlyUsed(): void {
    if (this.accessOrder.size === 0) {
      return;
    }

    // Find the least recently used key
    let oldestKey: string | null = null;
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

  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
  }

  private startCleanupTimer(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

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

/**
 * Redis cache implementation using ioredis
 * Note: Requires 'ioredis' package to be installed
 */
export class RedisCacheProvider extends CacheProvider {
  private client: Record<string, unknown> = null;
  private connected = false;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    size: 0,
    hitRate: 0
  };

  constructor(
    private readonly config: NonNullable<CacheConfig['redis']>,
    private readonly defaultTtl: number = 3600
  ) {
    super();
    // Don't auto-connect in constructor to avoid blocking
  }

  private async ensureConnection(): Promise<void> {
    if (this.connected && this.client) {
      return;
    }

    try {
      // Dynamic import to handle optional dependency
      const Redis = await import('ioredis').catch(() => {
        throw new Error(
          'Redis cache requires ioredis package. Install with: npm install ioredis'
        );
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
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw new Error(`Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async get<T>(key: string): Promise<T | null> {
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
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureConnection();

    try {
      const fullKey = this.getFullKey(key);
      const serializedValue = JSON.stringify(value);
      const expireTime = ttl || this.defaultTtl;

      await this.client.setex(fullKey, expireTime, serializedValue);
      this.stats.sets++;
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureConnection();

    try {
      const fullKey = this.getFullKey(key);
      const result = await this.client.del(fullKey);
      
      if (result > 0) {
        this.stats.deletes++;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    await this.ensureConnection();

    try {
      const pattern = this.getFullKey('*');
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnection();

    try {
      const fullKey = this.getFullKey(key);
      const exists = await this.client.exists(fullKey);
      return exists > 0;
    } catch (error) {
      console.error('Redis has error:', error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  async close(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }

  private getFullKey(key: string): string {
    const prefix = this.config.keyPrefix || 'macro_api';
    return `${prefix}:${key}`;
  }

  private updateHitRate(): void {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
  }
}

/**
 * Hybrid cache provider (Memory + Redis)
 */
export class HybridCacheProvider extends CacheProvider {
  private l1Cache: MemoryCacheProvider;
  private l2Cache: RedisCacheProvider;

  constructor(
    memoryMaxSize: number,
    redisConfig: NonNullable<CacheConfig['redis']>,
    defaultTtl: number = 3600
  ) {
    super();
    this.l1Cache = new MemoryCacheProvider(memoryMaxSize, defaultTtl);
    this.l2Cache = new RedisCacheProvider(redisConfig, defaultTtl);
  }

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    let value = await this.l1Cache.get<T>(key);
    
    if (value !== null) {
      return value;
    }

    // Try L2 cache
    try {
      value = await this.l2Cache.get<T>(key);
      
      if (value !== null) {
        // Promote to L1 cache
        await this.l1Cache.set(key, value);
        return value;
      }
    } catch (error) {
      console.warn('L2 cache error, falling back to L1 only:', error);
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Set in L1 cache first (always succeeds)
    await this.l1Cache.set(key, value, ttl);
    
    // Try to set in L2 cache (may fail)
    try {
      await this.l2Cache.set(key, value, ttl);
    } catch (error) {
      console.warn('L2 cache set failed, continuing with L1 only:', error);
    }
  }

  async delete(key: string): Promise<boolean> {
    const l1Result = await this.l1Cache.delete(key);
    
    let l2Result = false;
    try {
      l2Result = await this.l2Cache.delete(key);
    } catch (error) {
      console.warn('L2 cache delete failed:', error);
    }

    return l1Result || l2Result;
  }

  async clear(): Promise<void> {
    await this.l1Cache.clear();
    
    try {
      await this.l2Cache.clear();
    } catch (error) {
      console.warn('L2 cache clear failed:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    // Check L1 first
    const l1Has = await this.l1Cache.has(key);
    if (l1Has) {
      return true;
    }

    // Check L2
    try {
      return await this.l2Cache.has(key);
    } catch (error) {
      console.warn('L2 cache has check failed:', error);
      return false;
    }
  }

  async getStats(): Promise<CacheStats> {
    const l1Stats = await this.l1Cache.getStats();
    
    let l2Stats: CacheStats;
    try {
      l2Stats = await this.l2Cache.getStats();
    } catch (error) {
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

  async close(): Promise<void> {
    await Promise.all([
      this.l1Cache.close(),
      this.l2Cache.close().catch(error => {
        console.warn('L2 cache close failed:', error);
      })
    ]);
  }
}

/**
 * Main cache manager
 */
export class CacheManager {
  private provider: CacheProvider;

  constructor(config: CacheConfig) {
    this.provider = this.createProvider(config);
  }

  private createProvider(config: CacheConfig): CacheProvider {
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
        return new HybridCacheProvider(
          config.maxSize || 1000,
          config.redis,
          config.ttl
        );
      
      default:
        throw new Error(`Unsupported cache type: ${config.type}`);
    }
  }

  /**
   * Generate cache key to avoid collisions
   */
  generateKey(service: string, method: string, params: object): string {
    const paramHash = crypto
      .createHash('md5')
      .update(JSON.stringify(params, Object.keys(params).sort()))
      .digest('hex')
      .substring(0, 8);
    
    return `macro_api:${service}:${method}:${paramHash}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    return this.provider.get<T>(key);
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    return this.provider.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    return this.provider.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    return this.provider.clear();
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    return this.provider.has(key);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    return this.provider.getStats();
  }

  /**
   * Close cache connections
   */
  async close(): Promise<void> {
    return this.provider.close();
  }

  /**
   * Wrap a function with caching
   */
  async cached<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
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
  memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    keyGenerator: (...args: TArgs) => string,
    ttl?: number
  ): (...args: TArgs) => Promise<TReturn> {
    return async (...args: TArgs): Promise<TReturn> => {
      const key = keyGenerator(...args);
      return this.cached(key, () => fn(...args), ttl);
    };
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
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
  async warmUp<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    const promises = entries.map(entry => 
      this.set(entry.key, entry.value, entry.ttl)
    );
    
    await Promise.all(promises);
  }
}


