export interface ValidationIssue {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Base error class for all macro_api errors
 */
export class MacroApiError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: unknown;
  public readonly timestamp: Date;
  public readonly service?: string;

  constructor(
    message: string,
    code = 'UNKNOWN_ERROR',
    statusCode?: number,
    details?: unknown,
    service?: string
  ) {
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

/**
 * Authentication related errors
 */
export class AuthenticationError extends MacroApiError {
  constructor(message = 'Authentication failed', service?: string, details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, details, service);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends MacroApiError {
  public readonly retryAfter?: number;

  constructor(
    message = 'Rate limit exceeded',
    retryAfter?: number,
    service?: string,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, details, service);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends MacroApiError {
  constructor(message = 'Resource not found', service?: string, details?: unknown) {
    super(message, 'NOT_FOUND_ERROR', 404, details, service);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Service unreachable errors
 */
export class ServiceUnreachableError extends MacroApiError {
  constructor(message = 'Service is unreachable', service?: string, details?: unknown) {
    super(message, 'SERVICE_UNREACHABLE_ERROR', 503, details, service);
    this.name = 'ServiceUnreachableError';
    Object.setPrototypeOf(this, ServiceUnreachableError.prototype);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends MacroApiError {
  public readonly issues: ValidationIssue[];

  constructor(
    message = 'Validation failed',
    issues: ValidationIssue[] = [],
    service?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400, { issues }, service);
    this.name = 'ValidationError';
    this.issues = issues;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends MacroApiError {
  constructor(message = 'Configuration error', service?: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', 500, details, service);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Permission errors
 */
export class PermissionError extends MacroApiError {
  constructor(message = 'Insufficient permissions', service?: string, details?: unknown) {
    super(message, 'PERMISSION_ERROR', 403, details, service);
    this.name = 'PermissionError';
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Quota exceeded errors
 */
export class QuotaExceededError extends MacroApiError {
  constructor(message = 'Quota exceeded', service?: string, details?: unknown) {
    super(message, 'QUOTA_EXCEEDED_ERROR', 429, details, service);
    this.name = 'QuotaExceededError';
    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends MacroApiError {
  public readonly timeout: number;

  constructor(
    message = 'Request timeout',
    timeout = 30000,
    service?: string,
    details?: unknown
  ) {
    super(message, 'TIMEOUT_ERROR', 408, details, service);
    this.name = 'TimeoutError';
    this.timeout = timeout;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Network errors
 */
export class NetworkError extends MacroApiError {
  constructor(message = 'Network error', service?: string, details?: unknown) {
    super(message, 'NETWORK_ERROR', 0, details, service);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Conflict errors
 */
export class ConflictError extends MacroApiError {
  constructor(message = 'Conflict error', service?: string, details?: unknown) {
    super(message, 'CONFLICT_ERROR', 409, details, service);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Robust axios error type definition
 */
interface AxiosErrorLike {
  message: string;
  isAxiosError?: true;
  response?: {
    status: number;
    data?: {
      message?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  request?: unknown;
  config?: unknown;
  code?: string;
  stack?: string;
}

/**
 * Bulletproof type guard for axios errors
 */
function isAxiosErrorLike(error: unknown): error is AxiosErrorLike {
  // Fast path: null/undefined check
  if (!error || typeof error !== 'object') {
    return false;
  }

  const err = error as Record<string, unknown>;

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
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>;
    if (typeof errorObj.message === 'string') {
      return errorObj.message;
    }
  }
  
  return 'Unknown error occurred';
}

/**
 * Error factory for creating appropriate error instances
 */
export class ErrorFactory {
  static fromHttpStatus(
    statusCode: number,
    message: string,
    service?: string,
    details?: unknown
  ): MacroApiError {
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

  static fromAxiosError(error: unknown, service?: string): MacroApiError {
    // Handle non-axios errors
    if (!isAxiosErrorLike(error)) {
      const message = extractErrorMessage(error);
      return new MacroApiError(message, 'UNKNOWN_ERROR', undefined, error, service);
    }

    // Handle axios errors with response
    if (error.response && typeof error.response.status === 'number') {
      const responseMessage = error.response.data?.message || error.message;
      return this.fromHttpStatus(
        error.response.status,
        responseMessage,
        service,
        error.response.data
      );
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

  static fromError(error: unknown, service?: string): MacroApiError {
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

/**
 * Global error handler with logging and metrics
 */
export class ErrorHandler {
  private static instance: ErrorHandler | null = null;
  private readonly errorCounts = new Map<string, number>();
  private readonly lastErrors = new Map<string, Date>();

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(error: unknown, context?: { service?: string; operation?: string }): MacroApiError {
    const macroError = ErrorFactory.fromError(error, context?.service);

    // Track error metrics
    this.trackError(macroError, context);

    // Log error
    this.logError(macroError, context);

    return macroError;
  }

  private trackError(error: MacroApiError, context?: { service?: string; operation?: string }): void {
    const key = `${error.code}:${context?.service || 'unknown'}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    this.lastErrors.set(key, new Date());
  }

  private logError(error: MacroApiError, context?: { service?: string; operation?: string }): void {
    const logContext = {
      error: error.toJSON(),
      context,
      count: this.errorCounts.get(`${error.code}:${context?.service || 'unknown'}`) || 1
    };

    if (error.statusCode && error.statusCode >= 500) {
      console.error('Macro API Error (Server):', logContext);
    } else if (error.statusCode && error.statusCode >= 400) {
      console.warn('Macro API Error (Client):', logContext);
    } else {
      console.error('Macro API Error (Unknown):', logContext);
    }
  }

  getErrorStats(): Array<{ code: string; service: string; count: number; lastOccurred: Date }> {
    const stats: Array<{ code: string; service: string; count: number; lastOccurred: Date }> = [];

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

  reset(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }
}

/**
 * Retry manager with exponential backoff
 */
export class RetryManager {
  constructor(
    private readonly maxRetries = 3,
    private readonly baseDelay = 1000,
    private readonly maxDelay = 30000,
    private readonly jitter = true
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    context?: string,
    service?: string
  ): Promise<T> {
    let lastError: unknown;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        return await operation();
      } catch (error) {
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

  private shouldRetry(error: unknown): boolean {
    if (error instanceof MacroApiError) {
      // Don't retry client errors (4xx), except rate limiting
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
        return error instanceof RateLimitError;
      }
      
      // Retry server errors (5xx) and network issues
      return (
        error instanceof ServiceUnreachableError || 
        error instanceof TimeoutError || 
        error instanceof NetworkError ||
        (!!error.statusCode && error.statusCode >= 500)
      );
    }

    // Retry unknown errors by default
    return true;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.baseDelay * Math.pow(2, attempt - 1);
    
    if (this.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.min(delay, this.maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt = 0;
  private successCount = 0;

  constructor(
    private readonly failureThreshold = 5,
    private readonly recoveryTimeout = 60000,
    private readonly monitoringPeriod = 10000,
    private readonly successThreshold = 3
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
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
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    } else {
      this.state = 'CLOSED';
    }
  }

  private onFailure(): void {
    this.failures++;
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }
  }

  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }

  getFailureCount(): number {
    return this.failures;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.nextAttempt = 0;
    this.successCount = 0;
  }
}

