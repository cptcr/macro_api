// src/utils/errorHandling.ts

/**
 * Utility functions for consistent error handling across the macro_api codebase
 * Solves TypeScript TS18046 errors and provides better type safety
 */

export interface AxiosErrorLike {
  message: string;
  response?: {
    status: number;
    statusText: string;
    data?: unknown;
    headers?: Record<string, unknown>;
  };
  request?: unknown;
  config?: unknown;
  code?: string;
  isAxiosError?: boolean;
}

/**
 * Type guard to check if an error is an Axios-like error
 */
export function isAxiosError(error: unknown): error is AxiosErrorLike {
  return (
    error instanceof Error &&
    ('response' in error || 'request' in error || 'config' in error)
  );
}

/**
 * Type guard to check if an error has a response object
 */
export function hasAxiosResponse(error: unknown): error is AxiosErrorLike & { response: NonNullable<AxiosErrorLike['response']> } {
  return isAxiosError(error) && !!error.response;
}

/**
 * Safely extract error message from unknown error
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
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
 * Handle Axios errors consistently across all API classes
 */
export function handleAxiosError(error: unknown, serviceName: string): never {
  const message = extractErrorMessage(error);
  
  if (hasAxiosResponse(error)) {
    const { response } = error;
    
    // Try to extract API-specific error message
    let apiMessage = message;
    if (response.data && typeof response.data === 'object') {
      const data = response.data as Record<string, unknown>;
      if (typeof data.message === 'string') {
        apiMessage = data.message;
      } else if (typeof data.error === 'string') {
        apiMessage = data.error;
      } else if (Array.isArray(data.errors) && data.errors.length > 0) {
        const firstError = data.errors[0];
        if (typeof firstError === 'string') {
          apiMessage = firstError;
        } else if (typeof firstError === 'object' && firstError && 'message' in firstError) {
          apiMessage = String(firstError.message);
        }
      }
    }
    
    throw new Error(`${serviceName} API Error (${response.status}): ${apiMessage}`);
  }
  
  if (isAxiosError(error)) {
    // Handle network errors, timeouts, etc.
    if (error.code === 'ECONNABORTED' || error.code === 'TIMEOUT') {
      throw new Error(`${serviceName} API Timeout: ${message}`);
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(`${serviceName} API Connection Error: ${message}`);
    }
    
    throw new Error(`${serviceName} API Network Error: ${message}`);
  }
  
  // Fallback for other error types
  throw new Error(`${serviceName} API Error: ${message}`);
}

/**
 * Safely convert unknown to Record<string, unknown>
 */
export function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value) && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
}

/**
 * Convert pagination params to Record<string, unknown> format
 */
export function toPaginationParams(params: unknown): Record<string, unknown> {
  if (params && typeof params === 'object' && !Array.isArray(params) && params !== null) {
    return params as Record<string, unknown>;
  }
  return {};
}

/**
 * Convert FormData or unknown data to proper request format
 */
export function toRequestData(data: unknown): Record<string, unknown> | FormData | undefined {
  if (!data) return undefined;
  
  // If it's already FormData, return as-is
  if (data instanceof FormData) {
    return data;
  }
  
  // If it's an object, ensure it's Record<string, unknown>
  if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
    return data as Record<string, unknown>;
  }
  
  return {};
}

/**
 * Safely convert unknown to string
 */
export function toString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Safely convert unknown to number
 */
export function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Safely get property from unknown object
 */
export function getProperty(obj: unknown, key: string): unknown {
  if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
    const record = obj as Record<string, unknown>;
    return record[key];
  }
  return undefined;
}

export default {
  handleAxiosError,
  extractErrorMessage,
  isAxiosError,
  hasAxiosResponse,
  toRecord,
  toPaginationParams,
  toRequestData,
  toString,
  toNumber,
  getProperty
};