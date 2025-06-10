export interface ValidationIssue {
    field: string;
    message: string;
    code: string;
    value?: unknown;
}
/**
 * Base error class for all macro_api errors
 */
export declare class MacroApiError extends Error {
    readonly code: string;
    readonly statusCode?: number;
    readonly details?: unknown;
    readonly timestamp: Date;
    readonly service?: string;
    constructor(message: string, code?: string, statusCode?: number, details?: unknown, service?: string);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        statusCode: number | undefined;
        details: unknown;
        timestamp: string;
        service: string | undefined;
        stack: string | undefined;
    };
}
/**
 * Authentication related errors
 */
export declare class AuthenticationError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Rate limiting errors
 */
export declare class RateLimitError extends MacroApiError {
    readonly retryAfter?: number;
    constructor(message?: string, retryAfter?: number, service?: string, details?: unknown);
}
/**
 * Resource not found errors
 */
export declare class NotFoundError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Service unreachable errors
 */
export declare class ServiceUnreachableError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Validation errors
 */
export declare class ValidationError extends MacroApiError {
    readonly issues: ValidationIssue[];
    constructor(message?: string, issues?: ValidationIssue[], service?: string);
}
/**
 * Configuration errors
 */
export declare class ConfigurationError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Permission errors
 */
export declare class PermissionError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Quota exceeded errors
 */
export declare class QuotaExceededError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Timeout errors
 */
export declare class TimeoutError extends MacroApiError {
    readonly timeout: number;
    constructor(message?: string, timeout?: number, service?: string, details?: unknown);
}
/**
 * Network errors
 */
export declare class NetworkError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Conflict errors
 */
export declare class ConflictError extends MacroApiError {
    constructor(message?: string, service?: string, details?: unknown);
}
/**
 * Error factory for creating appropriate error instances
 */
export declare class ErrorFactory {
    static fromHttpStatus(statusCode: number, message: string, service?: string, details?: unknown): MacroApiError;
    static fromAxiosError(error: unknown, service?: string): MacroApiError;
    static fromError(error: unknown, service?: string): MacroApiError;
}
/**
 * Global error handler with logging and metrics
 */
export declare class ErrorHandler {
    private static instance;
    private readonly errorCounts;
    private readonly lastErrors;
    static getInstance(): ErrorHandler;
    handle(error: unknown, context?: {
        service?: string;
        operation?: string;
    }): MacroApiError;
    private trackError;
    private logError;
    getErrorStats(): Array<{
        code: string;
        service: string;
        count: number;
        lastOccurred: Date;
    }>;
    reset(): void;
}
/**
 * Retry manager with exponential backoff
 */
export declare class RetryManager {
    private readonly maxRetries;
    private readonly baseDelay;
    private readonly maxDelay;
    private readonly jitter;
    constructor(maxRetries?: number, baseDelay?: number, maxDelay?: number, jitter?: boolean);
    execute<T>(operation: () => Promise<T>, context?: string, service?: string): Promise<T>;
    private shouldRetry;
    private calculateDelay;
    private sleep;
}
/**
 * Circuit breaker pattern implementation
 */
export declare class CircuitBreaker {
    private readonly failureThreshold;
    private readonly recoveryTimeout;
    private readonly monitoringPeriod;
    private readonly successThreshold;
    private failures;
    private state;
    private nextAttempt;
    private successCount;
    constructor(failureThreshold?: number, recoveryTimeout?: number, monitoringPeriod?: number, successThreshold?: number);
    execute<T>(operation: () => Promise<T>, fallback?: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    getFailureCount(): number;
    reset(): void;
}
