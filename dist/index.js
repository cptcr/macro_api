"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacroAPIClient = exports.PACKAGE_INFO = exports.VERSION = exports.CircuitBreaker = exports.RetryManager = exports.ErrorHandler = exports.ErrorFactory = exports.ConflictError = exports.NetworkError = exports.TimeoutError = exports.QuotaExceededError = exports.PermissionError = exports.ConfigurationError = exports.ValidationError = exports.ServiceUnreachableError = exports.NotFoundError = exports.RateLimitError = exports.AuthenticationError = exports.MacroApiError = exports.HybridCacheProvider = exports.RedisCacheProvider = exports.MemoryCacheProvider = exports.CacheManager = exports.DockerHubAPI = exports.S3API = exports.VercelAPI = exports.SendGridAPI = exports.SlackAPI = exports.StripeAPI = exports.PayPalAPI = exports.NotionAPI = exports.GitHubAPI = exports.FootballAPI = exports.ChatGPT = exports.DeepSeek = exports.Valorant = exports.SpotifyAPI = exports.YouTubeNotify = void 0;
const cache_1 = require("./core/cache");
const errors_1 = require("./core/errors");
// Core API Classes
var YouTubeNotify_1 = require("./classes/YouTubeNotify");
Object.defineProperty(exports, "YouTubeNotify", { enumerable: true, get: function () { return YouTubeNotify_1.YouTubeNotify; } });
var SpotifyAPI_1 = require("./classes/SpotifyAPI");
Object.defineProperty(exports, "SpotifyAPI", { enumerable: true, get: function () { return SpotifyAPI_1.SpotifyAPI; } });
var Valorant_1 = require("./classes/Valorant");
Object.defineProperty(exports, "Valorant", { enumerable: true, get: function () { return Valorant_1.Valorant; } });
var DeepSeek_1 = require("./classes/DeepSeek");
Object.defineProperty(exports, "DeepSeek", { enumerable: true, get: function () { return DeepSeek_1.DeepSeek; } });
var ChatGPT_1 = require("./classes/ChatGPT");
Object.defineProperty(exports, "ChatGPT", { enumerable: true, get: function () { return ChatGPT_1.ChatGPT; } });
var APIFootball_1 = require("./classes/APIFootball");
Object.defineProperty(exports, "FootballAPI", { enumerable: true, get: function () { return APIFootball_1.FootballAPI; } });
var GitHub_1 = require("./classes/GitHub");
Object.defineProperty(exports, "GitHubAPI", { enumerable: true, get: function () { return GitHub_1.GitHubAPI; } });
var Notion_1 = require("./classes/Notion");
Object.defineProperty(exports, "NotionAPI", { enumerable: true, get: function () { return Notion_1.NotionAPI; } });
var PayPal_1 = require("./classes/PayPal");
Object.defineProperty(exports, "PayPalAPI", { enumerable: true, get: function () { return PayPal_1.PayPalAPI; } });
var Stripe_1 = require("./classes/Stripe");
Object.defineProperty(exports, "StripeAPI", { enumerable: true, get: function () { return Stripe_1.StripeAPI; } });
// New Production-Ready APIs
var SlackAPI_1 = require("./classes/SlackAPI");
Object.defineProperty(exports, "SlackAPI", { enumerable: true, get: function () { return SlackAPI_1.SlackAPI; } });
var SendGridAPI_1 = require("./classes/SendGridAPI");
Object.defineProperty(exports, "SendGridAPI", { enumerable: true, get: function () { return SendGridAPI_1.SendGridAPI; } });
var VercelAPI_1 = require("./classes/VercelAPI");
Object.defineProperty(exports, "VercelAPI", { enumerable: true, get: function () { return VercelAPI_1.VercelAPI; } });
var S3API_1 = require("./classes/S3API");
Object.defineProperty(exports, "S3API", { enumerable: true, get: function () { return S3API_1.S3API; } });
var DockerHubAPI_1 = require("./classes/DockerHubAPI");
Object.defineProperty(exports, "DockerHubAPI", { enumerable: true, get: function () { return DockerHubAPI_1.DockerHubAPI; } });
// Core Infrastructure
var cache_2 = require("./core/cache");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return cache_2.CacheManager; } });
Object.defineProperty(exports, "MemoryCacheProvider", { enumerable: true, get: function () { return cache_2.MemoryCacheProvider; } });
Object.defineProperty(exports, "RedisCacheProvider", { enumerable: true, get: function () { return cache_2.RedisCacheProvider; } });
Object.defineProperty(exports, "HybridCacheProvider", { enumerable: true, get: function () { return cache_2.HybridCacheProvider; } });
var errors_2 = require("./core/errors");
Object.defineProperty(exports, "MacroApiError", { enumerable: true, get: function () { return errors_2.MacroApiError; } });
Object.defineProperty(exports, "AuthenticationError", { enumerable: true, get: function () { return errors_2.AuthenticationError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errors_2.RateLimitError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errors_2.NotFoundError; } });
Object.defineProperty(exports, "ServiceUnreachableError", { enumerable: true, get: function () { return errors_2.ServiceUnreachableError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errors_2.ValidationError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return errors_2.ConfigurationError; } });
Object.defineProperty(exports, "PermissionError", { enumerable: true, get: function () { return errors_2.PermissionError; } });
Object.defineProperty(exports, "QuotaExceededError", { enumerable: true, get: function () { return errors_2.QuotaExceededError; } });
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return errors_2.TimeoutError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return errors_2.NetworkError; } });
Object.defineProperty(exports, "ConflictError", { enumerable: true, get: function () { return errors_2.ConflictError; } });
Object.defineProperty(exports, "ErrorFactory", { enumerable: true, get: function () { return errors_2.ErrorFactory; } });
Object.defineProperty(exports, "ErrorHandler", { enumerable: true, get: function () { return errors_2.ErrorHandler; } });
Object.defineProperty(exports, "RetryManager", { enumerable: true, get: function () { return errors_2.RetryManager; } });
Object.defineProperty(exports, "CircuitBreaker", { enumerable: true, get: function () { return errors_2.CircuitBreaker; } });
// Package Information
exports.VERSION = '3.0.0';
exports.PACKAGE_INFO = {
    name: 'macro_api',
    version: exports.VERSION,
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
};
/**
 * Create a unified API client with caching and error handling
 */
class MacroAPIClient {
    constructor(options) {
        if (options?.cache) {
            this.cache = new cache_1.CacheManager(options.cache);
        }
        this.retryManager = new errors_1.RetryManager(options?.retries?.maxRetries || 3, options?.retries?.baseDelay || 1000, options?.retries?.maxDelay || 30000);
    }
    /**
     * Execute an API operation with built-in retry and caching
     */
    async execute(operation, options) {
        const { service = 'unknown', method = 'unknown', params = {}, cacheTtl, skipCache = false, skipRetry = false } = options || {};
        // Try cache first
        if (!skipCache && this.cache) {
            const cacheKey = this.cache.generateKey(service, method, params);
            const cached = await this.cache.get(cacheKey);
            if (cached !== null) {
                return cached;
            }
        }
        // Execute with retry logic
        let result;
        if (skipRetry) {
            result = await operation();
        }
        else {
            result = await this.retryManager.execute(operation, `${service}.${method}`, service);
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
    async clearCache() {
        if (this.cache) {
            await this.cache.clear();
        }
    }
    /**
     * Close connections and cleanup
     */
    async close() {
        if (this.cache) {
            await this.cache.close();
        }
    }
}
exports.MacroAPIClient = MacroAPIClient;
