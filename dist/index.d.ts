import { CacheConfig } from './core/cache';
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
export { SlackAPI } from './classes/SlackAPI';
export { SendGridAPI } from './classes/SendGridAPI';
export { VercelAPI } from './classes/VercelAPI';
export { S3API } from './classes/S3API';
export { DockerHubAPI } from './classes/DockerHubAPI';
export { CacheManager, MemoryCacheProvider, RedisCacheProvider, HybridCacheProvider } from './core/cache';
export { MacroApiError, AuthenticationError, RateLimitError, NotFoundError, ServiceUnreachableError, ValidationError, ConfigurationError, PermissionError, QuotaExceededError, TimeoutError, NetworkError, ConflictError, ErrorFactory, ErrorHandler, RetryManager, CircuitBreaker } from './core/errors';
export type { CacheConfig, CacheEntry, CacheStats, CacheProvider } from './core/cache';
export type { ValidationIssue } from './core/errors';
export type { SlackConfig, MessageOptions, Block, FileOptions, ChannelOptions, SearchOptions as SlackSearchOptions, SlashCommandPayload, CommandResponse, MessageResponse, Channel, User, Reminder, FileResponse, SearchResults } from './classes/SlackAPI';
export type { SendGridConfig, EmailOptions, Attachment, Recipient, Template, TemplateVersion, Contact, List, ListResponse, EmailResponse, EmailStats, ValidationResult, ScheduledEmail } from './classes/SendGridAPI';
export type { VercelConfig, DeploymentOptions, GitSource, File, FunctionConfiguration, Route, Redirect, Header, Rewrite, Deployment, Project, EnvironmentVariable, CronJob, Domain, LogEntry, CancellationResponse } from './classes/VercelAPI';
export type { S3Config, UploadOptions, GetOptions, ListOptions, CopyOptions, ObjectAcl, UploadResult, S3Object, S3ObjectInfo, S3ObjectList, DeleteResult as S3DeleteResult, CopyResult, AclResult } from './classes/S3API';
export type { DockerHubConfig, Repository, Tag, TagDetails, TagOptions, SearchOptions as DockerSearchOptions, SearchResult, DeleteResult as DockerDeleteResult, DownloadStats, BuildTrigger, WebhookConfig } from './classes/DockerHubAPI';
export declare const VERSION = "3.0.0";
export declare const PACKAGE_INFO: {
    readonly name: "macro_api";
    readonly version: "3.0.0";
    readonly description: "A comprehensive, production-ready API toolkit for various services";
    readonly license: "Apache-2.0";
    readonly author: "CPTCR";
    readonly repository: "https://github.com/cptcr/macro_api";
    readonly homepage: "https://macro-api-nine.vercel.app/";
    readonly documentation: "https://cptcr.github.io/macro_api/";
    readonly features: readonly ["Production-ready API wrappers", "Built-in error handling and retry logic", "Intelligent caching system", "TypeScript support", "Comprehensive testing", "Circuit breaker pattern", "Request batching", "Webhook verification", "Rate limiting protection"];
    readonly supportedServices: readonly ["Stripe - Payment processing", "Slack - Team communication", "SendGrid - Email delivery", "Vercel - Deployment automation", "AWS S3 - Object storage", "Docker Hub - Container registry", "YouTube - Video platform", "Spotify - Music streaming", "Valorant - Gaming statistics", "DeepSeek - AI models", "ChatGPT - OpenAI models", "GitHub - Version control", "Notion - Productivity", "PayPal - Payments", "Football API - Sports data"];
};
/**
 * Create a unified API client with caching and error handling
 */
export declare class MacroAPIClient {
    private cache?;
    private retryManager;
    constructor(options?: {
        cache?: CacheConfig;
        retries?: {
            maxRetries?: number;
            baseDelay?: number;
            maxDelay?: number;
        };
    });
    /**
     * Execute an API operation with built-in retry and caching
     */
    execute<T>(operation: () => Promise<T>, options?: {
        service: string;
        method: string;
        params?: object;
        cacheTtl?: number;
        skipCache?: boolean;
        skipRetry?: boolean;
    }): Promise<T>;
    /**
     * Get cache statistics
     */
    getCacheStats(): Promise<import("./core/cache").CacheStats | null>;
    /**
     * Clear cache
     */
    clearCache(): Promise<void>;
    /**
     * Close connections and cleanup
     */
    close(): Promise<void>;
}
