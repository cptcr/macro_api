"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.RetryManager = exports.ErrorHandler = exports.ErrorFactory = exports.ConflictError = exports.NetworkError = exports.TimeoutError = exports.QuotaExceededError = exports.PermissionError = exports.ConfigurationError = exports.ValidationError = exports.ServiceUnreachableError = exports.NotFoundError = exports.RateLimitError = exports.AuthenticationError = exports.MacroApiError = void 0;
/**
 * Base error class for all macro_api errors
 */
class MacroApiError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', statusCode, details, service) {
        super(message);
        this.name = 'MacroApiError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date();
        this.service = service;
        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, MacroApiError.prototype);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
            service: this.service,
            stack: this.stack
        };
    }
}
exports.MacroApiError = MacroApiError;
/**
 * Authentication related errors
 */
class AuthenticationError extends MacroApiError {
    constructor(message = 'Authentication failed', service, details) {
        super(message, 'AUTHENTICATION_ERROR', 401, details, service);
        this.name = 'AuthenticationError';
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Rate limiting errors
 */
class RateLimitError extends MacroApiError {
    constructor(message = 'Rate limit exceeded', retryAfter, service, details) {
        super(message, 'RATE_LIMIT_ERROR', 429, details, service);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Resource not found errors
 */
class NotFoundError extends MacroApiError {
    constructor(message = 'Resource not found', service, details) {
        super(message, 'NOT_FOUND_ERROR', 404, details, service);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Service unreachable errors
 */
class ServiceUnreachableError extends MacroApiError {
    constructor(message = 'Service is unreachable', service, details) {
        super(message, 'SERVICE_UNREACHABLE_ERROR', 503, details, service);
        this.name = 'ServiceUnreachableError';
        Object.setPrototypeOf(this, ServiceUnreachableError.prototype);
    }
}
exports.ServiceUnreachableError = ServiceUnreachableError;
/**
 * Validation errors
 */
class ValidationError extends MacroApiError {
    constructor(message = 'Validation failed', issues = [], service) {
        super(message, 'VALIDATION_ERROR', 400, { issues }, service);
        this.name = 'ValidationError';
        this.issues = issues;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
/**
 * Configuration errors
 */
class ConfigurationError extends MacroApiError {
    constructor(message = 'Configuration error', service, details) {
        super(message, 'CONFIGURATION_ERROR', 500, details, service);
        this.name = 'ConfigurationError';
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
}
exports.ConfigurationError = ConfigurationError;
/**
 * Permission errors
 */
class PermissionError extends MacroApiError {
    constructor(message = 'Insufficient permissions', service, details) {
        super(message, 'PERMISSION_ERROR', 403, details, service);
        this.name = 'PermissionError';
        Object.setPrototypeOf(this, PermissionError.prototype);
    }
}
exports.PermissionError = PermissionError;
/**
 * Quota exceeded errors
 */
class QuotaExceededError extends MacroApiError {
    constructor(message = 'Quota exceeded', service, details) {
        super(message, 'QUOTA_EXCEEDED_ERROR', 429, details, service);
        this.name = 'QuotaExceededError';
        Object.setPrototypeOf(this, QuotaExceededError.prototype);
    }
}
exports.QuotaExceededError = QuotaExceededError;
/**
 * Timeout errors
 */
class TimeoutError extends MacroApiError {
    constructor(message = 'Request timeout', timeout = 30000, service, details) {
        super(message, 'TIMEOUT_ERROR', 408, details, service);
        this.name = 'TimeoutError';
        this.timeout = timeout;
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * Network errors
 */
class NetworkError extends MacroApiError {
    constructor(message = 'Network error', service, details) {
        super(message, 'NETWORK_ERROR', 0, details, service);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
exports.NetworkError = NetworkError;
/**
 * Conflict errors
 */
class ConflictError extends MacroApiError {
    constructor(message = 'Conflict error', service, details) {
        super(message, 'CONFLICT_ERROR', 409, details, service);
        this.name = 'ConflictError';
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
/**
 * Bulletproof type guard for axios errors
 */
function isAxiosErrorLike(error) {
    // Fast path: null/undefined check
    if (!error || typeof error !== 'object') {
        return false;
    }
    const err = error;
    // Must have message property (string)
    if (typeof err.message !== 'string') {
        return false;
    }
    // Check for axios-specific markers
    const hasAxiosMarker = err.isAxiosError === true;
    const hasResponse = typeof err.response === 'object' && err.response !== null;
    const hasConfig = typeof err.config === 'object';
    return hasAxiosMarker || (hasResponse && hasConfig);
}
/**
 * Safe error message extraction
 */
function extractErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (error && typeof error === 'object') {
        const errorObj = error;
        if (typeof errorObj.message === 'string') {
            return errorObj.message;
        }
    }
    return 'Unknown error occurred';
}
/**
 * Error factory for creating appropriate error instances
 */
class ErrorFactory {
    static fromHttpStatus(statusCode, message, service, details) {
        switch (statusCode) {
            case 400:
                return new ValidationError(message, [], service);
            case 401:
                return new AuthenticationError(message, service, details);
            case 403:
                return new PermissionError(message, service, details);
            case 404:
                return new NotFoundError(message, service, details);
            case 408:
                return new TimeoutError(message, 30000, service, details);
            case 409:
                return new ConflictError(message, service, details);
            case 429:
                return new RateLimitError(message, undefined, service, details);
            case 503:
                return new ServiceUnreachableError(message, service, details);
            default:
                return new MacroApiError(message, 'HTTP_ERROR', statusCode, details, service);
        }
    }
    static fromAxiosError(error, service) {
        // Handle non-axios errors
        if (!isAxiosErrorLike(error)) {
            const message = extractErrorMessage(error);
            return new MacroApiError(message, 'UNKNOWN_ERROR', undefined, error, service);
        }
        // Handle axios errors with response
        if (error.response && typeof error.response.status === 'number') {
            const responseMessage = error.response.data?.message || error.message;
            return this.fromHttpStatus(error.response.status, responseMessage, service, error.response.data);
        }
        // Handle network/timeout errors
        if (error.code) {
            switch (error.code) {
                case 'ECONNABORTED':
                case 'TIMEOUT':
                    return new TimeoutError(error.message, undefined, service, { code: error.code });
                case 'ENOTFOUND':
                case 'ECONNREFUSED':
                case 'ENETDOWN':
                case 'ENETUNREACH':
                    return new NetworkError(error.message, service, { code: error.code });
                default:
                    return new MacroApiError(error.message, 'NETWORK_ERROR', undefined, error, service);
            }
        }
        // Fallback for other axios errors
        return new MacroApiError(error.message, 'REQUEST_ERROR', undefined, error, service);
    }
    static fromError(error, service) {
        if (error instanceof MacroApiError) {
            return error;
        }
        if (isAxiosErrorLike(error)) {
            return this.fromAxiosError(error, service);
        }
        const message = extractErrorMessage(error);
        return new MacroApiError(message, 'UNKNOWN_ERROR', undefined, error, service);
    }
}
exports.ErrorFactory = ErrorFactory;
/**
 * Global error handler with logging and metrics
 */
class ErrorHandler {
    constructor() {
        this.errorCounts = new Map();
        this.lastErrors = new Map();
    }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    handle(error, context) {
        const macroError = ErrorFactory.fromError(error, context?.service);
        // Track error metrics
        this.trackError(macroError, context);
        // Log error
        this.logError(macroError, context);
        return macroError;
    }
    trackError(error, context) {
        const key = `${error.code}:${context?.service || 'unknown'}`;
        this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
        this.lastErrors.set(key, new Date());
    }
    logError(error, context) {
        const logContext = {
            error: error.toJSON(),
            context,
            count: this.errorCounts.get(`${error.code}:${context?.service || 'unknown'}`) || 1
        };
        if (error.statusCode && error.statusCode >= 500) {
            console.error('Macro API Error (Server):', logContext);
        }
        else if (error.statusCode && error.statusCode >= 400) {
            console.warn('Macro API Error (Client):', logContext);
        }
        else {
            console.error('Macro API Error (Unknown):', logContext);
        }
    }
    getErrorStats() {
        const stats = [];
        for (const [key, count] of this.errorCounts.entries()) {
            const [code, service] = key.split(':', 2);
            const lastOccurred = this.lastErrors.get(key) || new Date();
            stats.push({
                code: code || 'UNKNOWN',
                service: service || 'unknown',
                count,
                lastOccurred
            });
        }
        return stats.sort((a, b) => b.count - a.count);
    }
    reset() {
        this.errorCounts.clear();
        this.lastErrors.clear();
    }
}
exports.ErrorHandler = ErrorHandler;
ErrorHandler.instance = null;
/**
 * Retry manager with exponential backoff
 */
class RetryManager {
    constructor(maxRetries = 3, baseDelay = 1000, maxDelay = 30000, jitter = true) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
        this.jitter = jitter;
    }
    async execute(operation, context, service) {
        let lastError;
        let attempt = 0;
        while (attempt <= this.maxRetries) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                attempt++;
                if (attempt > this.maxRetries || !this.shouldRetry(error)) {
                    break;
                }
                const delay = this.calculateDelay(attempt);
                console.warn(`Retrying ${context || 'operation'} (attempt ${attempt}/${this.maxRetries}) after ${delay}ms`);
                await this.sleep(delay);
            }
        }
        throw ErrorHandler.getInstance().handle(lastError, { service, operation: context });
    }
    shouldRetry(error) {
        if (error instanceof MacroApiError) {
            // Don't retry client errors (4xx), except rate limiting
            if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
                return error instanceof RateLimitError;
            }
            // Retry server errors (5xx) and network issues
            return (error instanceof ServiceUnreachableError ||
                error instanceof TimeoutError ||
                error instanceof NetworkError ||
                (!!error.statusCode && error.statusCode >= 500));
        }
        // Retry unknown errors by default
        return true;
    }
    calculateDelay(attempt) {
        let delay = this.baseDelay * Math.pow(2, attempt - 1);
        if (this.jitter) {
            delay = delay * (0.5 + Math.random() * 0.5);
        }
        return Math.min(delay, this.maxDelay);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RetryManager = RetryManager;
/**
 * Circuit breaker pattern implementation
 */
class CircuitBreaker {
    constructor(failureThreshold = 5, recoveryTimeout = 60000, monitoringPeriod = 10000, successThreshold = 3) {
        this.failureThreshold = failureThreshold;
        this.recoveryTimeout = recoveryTimeout;
        this.monitoringPeriod = monitoringPeriod;
        this.successThreshold = successThreshold;
        this.failures = 0;
        this.state = 'CLOSED';
        this.nextAttempt = 0;
        this.successCount = 0;
    }
    async execute(operation, fallback) {
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                if (fallback) {
                    return await fallback();
                }
                throw new ServiceUnreachableError('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
            this.successCount = 0;
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failures = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= this.successThreshold) {
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
        else {
            this.state = 'CLOSED';
        }
    }
    onFailure() {
        this.failures++;
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.recoveryTimeout;
        }
    }
    getState() {
        return this.state;
    }
    getFailureCount() {
        return this.failures;
    }
    reset() {
        this.failures = 0;
        this.state = 'CLOSED';
        this.nextAttempt = 0;
        this.successCount = 0;
    }
}
exports.CircuitBreaker = CircuitBreaker;
