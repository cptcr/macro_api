/**
 * Jest Setup File for macro_api
 * Configures test environment, mocks, and global utilities
 */

import { TextEncoder, TextDecoder } from 'util';

// =============================================================================
// GLOBAL ENVIRONMENT SETUP
// =============================================================================

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

// Increase test timeout for integration tests
jest.setTimeout(30000);

// =============================================================================
// CONSOLE MOCKING (Optional - uncomment to suppress console output)
// =============================================================================

// Suppress console output during tests (uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
// };

// =============================================================================
// AXIOS MOCK SETUP
// =============================================================================

import axios from 'axios';
import { jest } from '@jest/globals';

// Create axios mock
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Default axios mock responses
mockedAxios.create.mockReturnValue(mockedAxios);

// =============================================================================
// REDIS MOCK SETUP
// =============================================================================

// Mock ioredis for cache tests
jest.mock('ioredis', () => {
  const mockRedis = {
    connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    get: jest.fn<(key: string) => Promise<string | null>>().mockResolvedValue(null),
    set: jest.fn<(key: string, value: string) => Promise<string>>().mockResolvedValue('OK'),
    setex: jest.fn<(key: string, ttl: number, value: string) => Promise<string>>().mockResolvedValue('OK'),
    del: jest.fn<(key: string) => Promise<number>>().mockResolvedValue(1),
    exists: jest.fn<(key: string) => Promise<number>>().mockResolvedValue(1),
    keys: jest.fn<(pattern: string) => Promise<string[]>>().mockResolvedValue([]),
    quit: jest.fn<() => Promise<string>>().mockResolvedValue('OK'),
    on: jest.fn(),
    off: jest.fn(),
    status: 'ready'
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockRedis),
    Redis: jest.fn(() => mockRedis)
  };
});

// =============================================================================
// TEST UTILITIES
// =============================================================================

/**
 * Mock HTTP response helper
 */
export const createMockResponse = (data: any, status = 200, headers = {}) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers,
  config: {},
  request: {}
});

/**
 * Mock error response helper
 */
export const createMockError = (
  message: string, 
  status?: number, 
  code?: string,
  isAxiosError = true
) => {
  const error: any = new Error(message);
  error.isAxiosError = isAxiosError;
  error.code = code;
  
  if (status) {
    error.response = {
      status,
      statusText: 'Error',
      data: { message },
      headers: {},
      config: {}
    };
  }
  
  return error;
};

/**
 * Test data factories
 */
export const TestData = {
  // YouTube test data
  youtubeVideo: {
    videoId: 'test-video-id',
    title: 'Test Video Title',
    channelId: 'test-channel-id',
    channelTitle: 'Test Channel',
    publishedAt: '2023-01-01T00:00:00Z',
    description: 'Test video description',
    thumbnailUrl: 'https://example.com/thumbnail.jpg'
  },

  // Spotify test data
  spotifyTrack: {
    id: 'test-track-id',
    name: 'Test Track',
    artists: [{ name: 'Test Artist', id: 'test-artist-id' }],
    album: { name: 'Test Album', id: 'test-album-id' },
    duration_ms: 180000,
    external_urls: { spotify: 'https://open.spotify.com/track/test' }
  },

  // Stripe test data
  stripePaymentIntent: {
    id: 'pi_test_123',
    amount: 2000,
    currency: 'usd',
    status: 'succeeded',
    client_secret: 'pi_test_123_secret',
    metadata: {}
  },

  // Slack test data
  slackMessage: {
    channel: 'C1234567890',
    text: 'Test message',
    ts: '1234567890.123456',
    user: 'U1234567890'
  },

  // SendGrid test data
  sendGridEmail: {
    personalizations: [{
      to: [{ email: 'test@example.com' }]
    }],
    from: { email: 'sender@example.com' },
    subject: 'Test Email',
    content: [{
      type: 'text/plain',
      value: 'Test email content'
    }]
  },

  // Vercel test data
  vercelDeployment: {
    uid: 'dpl_test_123',
    name: 'test-deployment',
    url: 'test-deployment.vercel.app',
    state: 'READY' as const,
    type: 'LAMBDAS' as const,
    createdAt: Date.now(),
    creator: {
      uid: 'user_123',
      username: 'testuser',
      email: 'test@example.com'
    },
    readyState: 'READY' as const,
    regions: ['iad1'],
    plan: 'hobby' as const,
    public: true,
    ownerId: 'user_123',
    projectId: 'prj_123',
    status: 'READY' as const
  },

  // S3 test data
  s3Object: {
    Key: 'test-file.txt',
    LastModified: new Date(),
    ETag: '"test-etag"',
    Size: 1024,
    StorageClass: 'STANDARD'
  },

  // Docker Hub test data
  dockerRepository: {
    user: 'testuser',
    name: 'test-repo',
    namespace: 'testuser',
    repositoryType: 'image' as const,
    status: 1,
    statusDescription: 'active',
    description: 'Test repository',
    isPrivate: false,
    isAutomated: false,
    canEdit: true,
    starCount: 10,
    pullCount: 1000,
    lastUpdated: '2023-01-01T00:00:00Z',
    hasStarred: false,
    fullDescription: 'Test repository description',
    affiliation: 'owner',
    permissions: {
      read: true,
      write: true,
      admin: true
    }
  }
};

/**
 * Mock API responses for common scenarios
 */
export const MockResponses = {
  // Success responses
  success: (data: any) => createMockResponse(data, 200),
  created: (data: any) => createMockResponse(data, 201),
  noContent: () => createMockResponse(null, 204),

  // Error responses
  badRequest: (message = 'Bad Request') => createMockError(message, 400),
  unauthorized: (message = 'Unauthorized') => createMockError(message, 401),
  forbidden: (message = 'Forbidden') => createMockError(message, 403),
  notFound: (message = 'Not Found') => createMockError(message, 404),
  conflict: (message = 'Conflict') => createMockError(message, 409),
  rateLimit: (message = 'Rate Limit Exceeded') => createMockError(message, 429),
  serverError: (message = 'Internal Server Error') => createMockError(message, 500),
  serviceUnavailable: (message = 'Service Unavailable') => createMockError(message, 503),

  // Network errors
  networkError: (message = 'Network Error') => createMockError(message, undefined, 'ECONNREFUSED'),
  timeoutError: (message = 'Timeout') => createMockError(message, undefined, 'ECONNABORTED')
};

/**
 * Test environment helpers
 */
export const TestHelpers = {
  /**
   * Wait for a specified amount of time
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generate random test data
   */
  randomString: (length = 10) => Math.random().toString(36).substring(2, length + 2),
  randomEmail: () => `test-${TestHelpers.randomString()}@example.com`,
  randomUrl: () => `https://example.com/${TestHelpers.randomString()}`,

  /**
   * Mock environment variables
   */
  mockEnv: (envVars: Record<string, string>) => {
    const originalEnv = { ...process.env };
    Object.assign(process.env, envVars);
    return () => {
      process.env = originalEnv;
    };
  },

  /**
   * Create a spy that tracks calls
   */
  createSpy: <T extends (...args: any[]) => any>(implementation?: T) => {
    return jest.fn(implementation);
  },

  /**
   * Reset all mocks
   */
  resetAllMocks: () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  }
};

// =============================================================================
// GLOBAL TEST HOOKS
// =============================================================================

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset axios mock to default behavior
  mockedAxios.get.mockReset();
  mockedAxios.post.mockReset();
  mockedAxios.put.mockReset();
  mockedAxios.patch.mockReset();
  mockedAxios.delete.mockReset();
  mockedAxios.request.mockReset();
});

afterEach(() => {
  // Clean up any test-specific state
  jest.restoreAllMocks();
});

// =============================================================================
// EXTEND JEST MATCHERS
// =============================================================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUrl(): R;
      toBeValidEmail(): R;
      toBeValidUuid(): R;
      toHaveBeenCalledWithAxiosConfig(config: object): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidUrl(received: string) {
    try {
      new URL(received);
      return {
        message: () => `expected ${received} not to be a valid URL`,
        pass: true
      };
    } catch {
      return {
        message: () => `expected ${received} to be a valid URL`,
        pass: false
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid email`
        : `expected ${received} to be a valid email`,
      pass
    };
  },

  toBeValidUuid(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid UUID`
        : `expected ${received} to be a valid UUID`,
      pass
    };
  },

  toHaveBeenCalledWithAxiosConfig(received: jest.Mock, expectedConfig: object) {
    const calls = received.mock.calls;
    const pass = calls.some(call => {
      const config = call[0];
      return Object.keys(expectedConfig).every(key => 
        config && config[key] === (expectedConfig as any)[key]
      );
    });

    return {
      message: () => pass
        ? `expected function not to have been called with config ${JSON.stringify(expectedConfig)}`
        : `expected function to have been called with config ${JSON.stringify(expectedConfig)}`,
      pass
    };
  }
});

// =============================================================================
// EXPORT MOCKED DEPENDENCIES
// =============================================================================

export { mockedAxios };

// =============================================================================
// PERFORMANCE MONITORING (for performance tests)
// =============================================================================

export const PerformanceHelpers = {
  /**
   * Measure execution time of an async function
   */
  measureTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * Create a performance benchmark
   */
  benchmark: async (
    name: string, 
    fn: () => Promise<any>, 
    iterations = 100
  ): Promise<{ name: string; avgTime: number; minTime: number; maxTime: number }> => {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    
    return {
      name,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times)
    };
  }
};

console.log('🧪 Jest setup complete - macro_api test environment ready!');