import { CacheManager, CacheConfig } from './core/cache';
import { RetryManager } from './core/errors';

// Core API Classes
export { YouTubeNotify } from './classes/YouTubeNotify';
export { SpotifyAPI } from './classes/SpotifyAPI';
export { Valorant } from './classes/Valorant';
export { DeepSeek } from './classes/DeepSeek';
export { ChatGPT } from './classes/ChatGPT';
export { FootballAPI } from './classes/APIFootball';
export { GitHubAPI } from './classes/GitHub';
export { NotionAPI } from './classes/Notion';
export { PayPalAPI } from './classes/PayPal';
export { StripeAPI } from './classes/Stripe';

// New Production-Ready APIs
export { SlackAPI } from './classes/SlackAPI';
export { SendGridAPI } from './classes/SendGridAPI';
export { VercelAPI } from './classes/VercelAPI';
export { S3API } from './classes/S3API';
export { DockerHubAPI } from './classes/DockerHubAPI';

// Core Infrastructure
export { 
  CacheManager, 
  MemoryCacheProvider, 
  RedisCacheProvider, 
  HybridCacheProvider 
} from './core/cache';

export {
  MacroApiError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ServiceUnreachableError,
  ValidationError,
  ConfigurationError,
  PermissionError,
  QuotaExceededError,
  TimeoutError,
  NetworkError,
  ConflictError,
  ErrorFactory,
  ErrorHandler,
  RetryManager,
  CircuitBreaker
} from './core/errors';

// Type Definitions - Core Infrastructure
export type {
  CacheConfig,
  CacheEntry,
  CacheStats,
  CacheProvider
} from './core/cache';

export type {
  ValidationIssue
} from './core/errors';

// Type Definitions - Slack
export type {
  SlackConfig,
  MessageOptions,
  Block,
  FileOptions,
  ChannelOptions,
  SearchOptions as SlackSearchOptions,
  SlashCommandPayload,
  CommandResponse,
  MessageResponse,
  Channel,
  User,
  Reminder,
  FileResponse,
  SearchResults
} from './classes/SlackAPI';

// Type Definitions - SendGrid
export type {
  SendGridConfig,
  EmailOptions,
  Attachment,
  Recipient,
  Template,
  TemplateVersion,
  Contact,
  List,
  ListResponse,
  EmailResponse,
  EmailStats,
  ValidationResult,
  ScheduledEmail
} from './classes/SendGridAPI';

// Type Definitions - Vercel
export type {
  VercelConfig,
  DeploymentOptions,
  GitSource,
  File,
  FunctionConfiguration,
  Route,
  Redirect,
  Header,
  Rewrite,
  Deployment,
  Project,
  EnvironmentVariable,
  CronJob,
  Domain,
  LogEntry,
  CancellationResponse
} from './classes/VercelAPI';

// Type Definitions - S3
export type {
  S3Config,
  UploadOptions,
  GetOptions,
  ListOptions,
  CopyOptions,
  ObjectAcl,
  UploadResult,
  S3Object,
  S3ObjectInfo,
  S3ObjectList,
  DeleteResult as S3DeleteResult,
  CopyResult,
  AclResult
} from './classes/S3API';

// Type Definitions - Docker Hub
export type {
  DockerHubConfig,
  Repository,
  Tag,
  TagDetails,
  TagOptions,
  SearchOptions as DockerSearchOptions,
  SearchResult,
  DeleteResult as DockerDeleteResult,
  DownloadStats,
  BuildTrigger,
  WebhookConfig
} from './classes/DockerHubAPI';

// Package Information
export const VERSION = '3.0.0';

export const PACKAGE_INFO = {
  name: 'macro_api',
  version: VERSION,
  description: 'A comprehensive, production-ready API toolkit for various services',
  license: 'Apache-2.0',
  author: 'CPTCR',
  repository: 'https://github.com/cptcr/macro_api',
  homepage: 'https://macro-api-nine.vercel.app/',
  documentation: 'https://cptcr.github.io/macro_api/',
  features: [
    'Production-ready API wrappers',
    'Built-in error handling and retry logic',
    'Intelligent caching system',
    'TypeScript support',
    'Comprehensive testing',
    'Circuit breaker pattern',
    'Request batching',
    'Webhook verification',
    'Rate limiting protection'
  ],
  supportedServices: [
    'Stripe - Payment processing',
    'Slack - Team communication',
    'SendGrid - Email delivery',
    'Vercel - Deployment automation',
    'AWS S3 - Object storage',
    'Docker Hub - Container registry',
    'YouTube - Video platform',
    'Spotify - Music streaming',
    'Valorant - Gaming statistics',
    'DeepSeek - AI models',
    'ChatGPT - OpenAI models',
    'GitHub - Version control',
    'Notion - Productivity',
    'PayPal - Payments',
    'Football API - Sports data'
  ]
} as const;

/**
 * Create a unified API client with caching and error handling
 */
export class MacroAPIClient {
  private cache?: CacheManager;
  private retryManager: RetryManager;

  constructor(options?: {
    cache?: CacheConfig;
    retries?: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
    };
  }) {
    if (options?.cache) {
      this.cache = new CacheManager(options.cache);
    }

    this.retryManager = new RetryManager(
      options?.retries?.maxRetries || 3,
      options?.retries?.baseDelay || 1000,
      options?.retries?.maxDelay || 30000
    );
  }

  /**
   * Execute an API operation with built-in retry and caching
   */
  async execute<T>(
    operation: () => Promise<T>,
    options?: {
      service: string;
      method: string;
      params?: object;
      cacheTtl?: number;
      skipCache?: boolean;
      skipRetry?: boolean;
    }
  ): Promise<T> {
    const { 
      service = 'unknown', 
      method = 'unknown', 
      params = {}, 
      cacheTtl, 
      skipCache = false, 
      skipRetry = false 
    } = options || {};

    // Try cache first
    if (!skipCache && this.cache) {
      const cacheKey = this.cache.generateKey(service, method, params);
      const cached = await this.cache.get<T>(cacheKey);
      
      if (cached !== null) {
        return cached;
      }
    }

    // Execute with retry logic
    let result: T;
    if (skipRetry) {
      result = await operation();
    } else {
      result = await this.retryManager.execute(
        operation,
        `${service}.${method}`,
        service
      );
    }

    // Cache result
    if (!skipCache && this.cache && result !== null && result !== undefined) {
      const cacheKey = this.cache.generateKey(service, method, params);
      await this.cache.set(cacheKey, result, cacheTtl);
    }

    return result;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cache ? await this.cache.getStats() : null;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    if (this.cache) {
      await this.cache.clear();
    }
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    if (this.cache) {
      await this.cache.close();
    }
  }
}