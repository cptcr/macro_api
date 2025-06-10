/**
 * Integration tests for API classes
 * These tests verify that the API classes work correctly with mocked responses
 */

import {
  MacroAPIClient,
  SlackAPI,
  SendGridAPI,
  StripeAPI,
  ErrorHandler
} from '../../src/index';
import { mockedAxios, MockResponses, TestData } from '../../tests/setup';

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ErrorHandler.getInstance().reset();
  });

  describe('MacroAPIClient', () => {
    let client: MacroAPIClient;

    beforeEach(() => {
      client = new MacroAPIClient({
        cache: {
          type: 'memory',
          ttl: 3600,
          maxSize: 100
        },
        retries: {
          maxRetries: 2,
          baseDelay: 100,
          maxDelay: 1000
        }
      });
    });

    afterEach(async () => {
      await client.close();
    });

    it('should execute operations with caching', async () => {
      let callCount = 0;
      const operation = jest.fn(async () => {
        callCount++;
        return `result-${callCount}`;
      });

      // First call should execute operation
      const result1 = await client.execute(operation, {
        service: 'test',
        method: 'getData',
        params: { id: '123' }
      });

      // Second call should return cached result
      const result2 = await client.execute(operation, {
        service: 'test',
        method: 'getData',
        params: { id: '123' }
      });

      expect(result1).toBe('result-1');
      expect(result2).toBe('result-1'); // Same cached result
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry failed operations', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue('success');

      const result = await client.execute(operation, {
        service: 'test',
        method: 'retryableOperation'
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should skip cache when requested', async () => {
      let callCount = 0;
      const operation = jest.fn(async () => {
        callCount++;
        return `result-${callCount}`;
      });

      const result1 = await client.execute(operation, {
        service: 'test',
        method: 'getData',
        skipCache: true
      });

      const result2 = await client.execute(operation, {
        service: 'test',
        method: 'getData',
        skipCache: true
      });

      expect(result1).toBe('result-1');
      expect(result2).toBe('result-2');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should provide cache statistics', async () => {
      const operation = jest.fn().mockResolvedValue('test-result');

      await client.execute(operation, {
        service: 'test',
        method: 'getData'
      });

      const stats = await client.getCacheStats();
      expect(stats).toBeDefined();
      expect(stats!.sets).toBe(1);
    });
  });

  describe('SlackAPI Integration', () => {
    let slackAPI: SlackAPI;

    beforeEach(() => {
      slackAPI = new SlackAPI({
        botToken: 'xoxb-test-token'
      });
    });

    it('should send messages successfully', async () => {
      const expectedResponse = {
        ok: true,
        channel: 'C1234567890',
        ts: '1234567890.123456',
        message: {
          type: 'message',
          text: 'Hello, World!',
          ts: '1234567890.123456',
          username: 'TestBot',
          botId: 'B1234567890'
        }
      };

      mockedAxios.post.mockResolvedValue(MockResponses.success(expectedResponse));

      const result = await slackAPI.sendMessage('C1234567890', 'Hello, World!');

      expect(result).toEqual(expectedResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://slack.com/api/chat.postMessage',
        expect.objectContaining({
          channel: 'C1234567890',
          text: 'Hello, World!'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer xoxb-test-token'
          })
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.post.mockRejectedValue(MockResponses.unauthorized('Invalid token'));

      await expect(slackAPI.sendMessage('C1234567890', 'Test')).rejects.toThrow('Invalid token');
    });

    it('should test connection', async () => {
      mockedAxios.get.mockResolvedValue(MockResponses.success({ ok: true }));

      const isConnected = await slackAPI.testConnection();

      expect(isConnected).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://slack.com/api/api.test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer xoxb-test-token'
          })
        })
      );
    });
  });

  describe('SendGridAPI Integration', () => {
    let sendGridAPI: SendGridAPI;

    beforeEach(() => {
      sendGridAPI = new SendGridAPI({
        apiKey: 'SG.test-api-key',
        defaultFromEmail: 'test@example.com',
        defaultFromName: 'Test Sender'
      });
    });

    it('should send emails successfully', async () => {
      mockedAxios.post.mockResolvedValue(MockResponses.success({ messageId: 'msg_123' }));

      const result = await sendGridAPI.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        text: 'This is a test email'
      });

      expect(result).toEqual({ messageId: 'msg_123' });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          personalizations: expect.arrayContaining([
            expect.objectContaining({
              to: [{ email: 'recipient@example.com' }]
            })
          ]),
          from: { email: 'test@example.com', name: 'Test Sender' },
          subject: 'Test Email',
          content: expect.arrayContaining([
            expect.objectContaining({
              type: 'text/plain',
              value: 'This is a test email'
            })
          ])
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer SG.test-api-key'
          })
        })
      );
    });

    it('should validate email addresses', async () => {
      const validationResult = {
        email: 'test@example.com',
        verdict: 'Valid',
        score: 0.99,
        local: 'test',
        host: 'example.com',
        checks: {
          domain: {
            hasValidAddressStructure: true,
            hasValidDomainStructure: true,
            isNotDisposableEmail: true,
            isNotSuspectedRole: true
          },
          localPart: {
            isValidFormat: true,
            isNotSuspectedRole: true
          },
          additional: {
            hasKnownTld: true,
            hasValidDomainStructure: true
          }
        },
        source: 'api',
        ipAddress: '192.168.1.1'
      };

      mockedAxios.post.mockResolvedValue(MockResponses.success(validationResult));

      const result = await sendGridAPI.validateEmail('test@example.com');

      expect(result).toEqual(validationResult);
    });

    it('should handle validation errors for invalid emails', async () => {
      await expect(sendGridAPI.validateEmail('invalid-email')).rejects.toThrow('Valid email address is required');
    });

    it('should test connection', async () => {
      mockedAxios.get.mockResolvedValue(MockResponses.success({ user: 'test' }));

      const isConnected = await sendGridAPI.testConnection();

      expect(isConnected).toBe(true);
    });
  });

  describe('StripeAPI Integration', () => {
    let stripeAPI: StripeAPI;

    beforeEach(() => {
      stripeAPI = new StripeAPI({
        secretKey: 'sk_test_123'
      });
    });

    it('should create payment intents', async () => {
      const paymentIntent = {
        id: 'pi_test_123',
        amount: 2000,
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: 'pi_test_123_secret'
      };

      mockedAxios.post.mockResolvedValue(MockResponses.success(paymentIntent));

      const result = await stripeAPI.createPaymentIntent({
        amount: 2000,
        currency: 'usd'
      });

      expect(result).toEqual(paymentIntent);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.stripe.com/v1/payment_intents',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk_test_123'
          })
        })
      );
    });

    it('should create customers', async () => {
      const customer = {
        id: 'cus_test_123',
        email: 'customer@example.com',
        name: 'Test Customer'
      };

      mockedAxios.post.mockResolvedValue(MockResponses.success(customer));

      const result = await stripeAPI.createCustomer({
        email: 'customer@example.com',
        name: 'Test Customer'
      });

      expect(result).toEqual(customer);
    });

    it('should handle Stripe API errors', async () => {
      const stripeError = {
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.'
        }
      };

      mockedAxios.post.mockRejectedValue({
        response: {
          status: 402,
          data: stripeError
        },
        message: 'Request failed with status code 402'
      });

      await expect(stripeAPI.createPaymentIntent({
        amount: 2000,
        currency: 'usd'
      })).rejects.toThrow();
    });

    it('should list customers with pagination', async () => {
      const customerList = {
        object: 'list',
        data: [
          { id: 'cus_1', email: 'customer1@example.com' },
          { id: 'cus_2', email: 'customer2@example.com' }
        ],
        has_more: false,
        total_count: 2
      };

      mockedAxios.get.mockResolvedValue(MockResponses.success(customerList));

      const result = await stripeAPI.listCustomers({
        limit: 10,
        starting_after: 'cus_start'
      });

      expect(result).toEqual(customerList);
    });
  });

  describe('Error Handling Integration', () => {
    let slackAPI: SlackAPI;

    beforeEach(() => {
      slackAPI = new SlackAPI({ botToken: 'test-token' });
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue(MockResponses.networkError('Connection failed'));

      await expect(slackAPI.sendMessage('C123', 'test')).rejects.toThrow('Connection failed');
    });

    it('should handle timeout errors', async () => {
      mockedAxios.post.mockRejectedValue(MockResponses.timeoutError('Request timeout'));

      await expect(slackAPI.sendMessage('C123', 'test')).rejects.toThrow('Request timeout');
    });

    it('should handle rate limiting', async () => {
      mockedAxios.post.mockRejectedValue(MockResponses.rateLimit('Rate limit exceeded'));

      await expect(slackAPI.sendMessage('C123', 'test')).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle server errors', async () => {
      mockedAxios.post.mockRejectedValue(MockResponses.serverError('Internal server error'));

      await expect(slackAPI.sendMessage('C123', 'test')).rejects.toThrow('Internal server error');
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required configuration', () => {
      expect(() => new SlackAPI({ botToken: '' })).toThrow('Slack bot token is required');
      expect(() => new SendGridAPI({ apiKey: '' })).toThrow('SendGrid API key is required');
      expect(() => new StripeAPI({ secretKey: '' })).toThrow('Stripe Secret Key is required');
    });

    it('should use default values when appropriate', () => {
      const sendGrid = new SendGridAPI({ apiKey: 'test-key' });
      expect(sendGrid).toBeDefined();

      const slack = new SlackAPI({ botToken: 'test-token' });
      expect(slack).toBeDefined();
    });
  });
});