import axios from 'axios';
import StripeAuthOptions from '../interfaces/Stripe/StripeAuthOptions';
import StripePaginationParams from '../interfaces/Stripe/StripePaginationParams';

/**
 * Complete Stripe API wrapper for interacting with all Stripe endpoints
 */
export class StripeAPI {
  private secretKey: string;
  private baseUrl: string = 'https://api.stripe.com/v1';
  
  /**
   * Create a new Stripe API client
   * @param options Authentication options
   */
  constructor(options: StripeAuthOptions) {
    this.secretKey = options.secretKey;
  }

  /**
   * Make a request to the Stripe API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Optional request body
   * @param params Optional query parameters
   */
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    data?: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<T> {
    // Convert data to URLSearchParams for proper format if data exists and method is not get
    const formData = data && method !== 'get' ? new URLSearchParams(data) : data;
    
    const response = await axios({
      method,
      url: `${this.baseUrl}${endpoint}`,
      data: formData,
      params,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': method !== 'get' ? 'application/x-www-form-urlencoded' : 'application/json'
      }
    });
    
    return response.data;
  }

  // Balance endpoints

  /**
   * Get current account balance
   */
  async getBalance() {
    return this.request<Record<string, unknown>>('get', '/balance');
  }

  /**
   * Get balance transaction by ID
   * @param transactionId Transaction ID
   */
  async getBalanceTransaction(transactionId: string) {
    return this.request<Record<string, unknown>>('get', `/balance/history/${transactionId}`);
  }

  /**
   * List balance transactions
   * @param params Pagination parameters
   */
  async listBalanceTransactions(params?: StripePaginationParams & {
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
    currency?: string;
    source?: string;
    type?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/balance/history', undefined, params);
  }

  // Charges endpoints

  /**
   * Create a charge
   * @param data Charge data
   */
  async createCharge(data: {
    amount: number;
    currency: string;
    source?: string;
    customer?: string;
    description?: string;
    metadata?: Record<string, string>;
    capture?: boolean;
    statement_descriptor?: string;
    receipt_email?: string;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/charges', data);
  }

  /**
   * Retrieve a charge
   * @param chargeId Charge ID
   */
  async getCharge(chargeId: string) {
    return this.request<Record<string, unknown>>('get', `/charges/${chargeId}`);
  }

  /**
   * Update a charge
   * @param chargeId Charge ID
   * @param data Update data
   */
  async updateCharge(chargeId: string, data: {
    description?: string;
    metadata?: Record<string, string>;
    receipt_email?: string;
    fraud_details?: Record<string, string>;
    shipping?: Record<string, unknown>;
    transfer_group?: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/charges/${chargeId}`, data);
  }

  /**
   * Capture a charge
   * @param chargeId Charge ID
   * @param data Capture data
   */
  async captureCharge(chargeId: string, data?: {
    amount?: number;
    receipt_email?: string;
    statement_descriptor?: string;
    application_fee_amount?: number;
  }) {
    return this.request<Record<string, unknown>>('post', `/charges/${chargeId}/capture`, data);
  }

  /**
   * List charges
   * @param params Pagination parameters
   */
  async listCharges(params?: StripePaginationParams & {
    customer?: string;
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
    payment_intent?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/charges', undefined, params);
  }

  // Customers endpoints

  /**
   * Create a customer
   * @param data Customer data
   */
  async createCustomer(data?: {
    address?: Record<string, string>;
    description?: string;
    email?: string;
    metadata?: Record<string, string>;
    name?: string;
    payment_method?: string;
    phone?: string;
    shipping?: Record<string, unknown>;
    source?: string;
  }) {
    return this.request<Record<string, unknown>>('post', '/customers', data);
  }

  /**
   * Retrieve a customer
   * @param customerId Customer ID
   */
  async getCustomer(customerId: string) {
    return this.request<Record<string, unknown>>('get', `/customers/${customerId}`);
  }

  /**
   * Update a customer
   * @param customerId Customer ID
   * @param data Update data
   */
  async updateCustomer(customerId: string, data: {
    address?: Record<string, string>;
    description?: string;
    email?: string;
    metadata?: Record<string, string>;
    name?: string;
    phone?: string;
    shipping?: Record<string, unknown>;
    source?: string;
    default_source?: string;
    invoice_settings?: Record<string, unknown>;
  }) {
    return this.request<Record<string, unknown>>('post', `/customers/${customerId}`, data);
  }

  /**
   * Delete a customer
   * @param customerId Customer ID
   */
  async deleteCustomer(customerId: string) {
    return this.request<Record<string, unknown>>('delete', `/customers/${customerId}`);
  }

  /**
   * List customers
   * @param params Pagination parameters
   */
  async listCustomers(params?: StripePaginationParams & {
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
    email?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/customers', undefined, params);
  }

  // Payment Methods endpoints

  /**
   * Create a payment method
   * @param data Payment method data
   */
  async createPaymentMethod(data: {
    type: string;
    card?: Record<string, unknown>;
    billing_details?: Record<string, unknown>;
    metadata?: Record<string, string>;
  }) {
    return this.request<Record<string, unknown>>('post', '/payment_methods', data);
  }

  /**
   * Retrieve a payment method
   * @param paymentMethodId Payment method ID
   */
  async getPaymentMethod(paymentMethodId: string) {
    return this.request<Record<string, unknown>>('get', `/payment_methods/${paymentMethodId}`);
  }

  /**
   * Update a payment method
   * @param paymentMethodId Payment method ID
   * @param data Update data
   */
  async updatePaymentMethod(paymentMethodId: string, data: {
    billing_details?: Record<string, unknown>;
    metadata?: Record<string, string>;
  }) {
    return this.request<Record<string, unknown>>('post', `/payment_methods/${paymentMethodId}`, data);
  }

  /**
   * List payment methods
   * @param params Query parameters
   */
  async listPaymentMethods(params: {
    customer: string;
    type: string;
    limit?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/payment_methods', undefined, params);
  }

  /**
   * Attach a payment method to a customer
   * @param paymentMethodId Payment method ID
   * @param data Attachment data
   */
  async attachPaymentMethod(paymentMethodId: string, data: {
    customer: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/payment_methods/${paymentMethodId}/attach`, data);
  }

  /**
   * Detach a payment method from a customer
   * @param paymentMethodId Payment method ID
   */
  async detachPaymentMethod(paymentMethodId: string) {
    return this.request<Record<string, unknown>>('post', `/payment_methods/${paymentMethodId}/detach`);
  }

  // Payment Intents endpoints

  /**
   * Create a payment intent
   * @param data Payment intent data
   */
  async createPaymentIntent(data: {
    amount: number;
    currency: string;
    payment_method_types?: string[];
    customer?: string;
    description?: string;
    metadata?: Record<string, string>;
    receipt_email?: string;
    payment_method?: string;
    confirm?: boolean;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/payment_intents', data);
  }

  /**
   * Retrieve a payment intent
   * @param paymentIntentId Payment intent ID
   */
  async getPaymentIntent(paymentIntentId: string) {
    return this.request<Record<string, unknown>>('get', `/payment_intents/${paymentIntentId}`);
  }

  /**
   * Update a payment intent
   * @param paymentIntentId Payment intent ID
   * @param data Update data
   */
  async updatePaymentIntent(paymentIntentId: string, data: {
    amount?: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
    payment_method_types?: string[];
    receipt_email?: string;
    shipping?: Record<string, unknown>;
    transfer_group?: string;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', `/payment_intents/${paymentIntentId}`, data);
  }

  /**
   * Confirm a payment intent
   * @param paymentIntentId Payment intent ID
   * @param data Confirmation data
   */
  async confirmPaymentIntent(paymentIntentId: string, data?: {
    payment_method?: string;
    return_url?: string;
    receipt_email?: string;
    shipping?: Record<string, unknown>;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', `/payment_intents/${paymentIntentId}/confirm`, data);
  }

  /**
   * Cancel a payment intent
   * @param paymentIntentId Payment intent ID
   * @param data Cancellation data
   */
  async cancelPaymentIntent(paymentIntentId: string, data?: {
    cancellation_reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
  }) {
    return this.request<Record<string, unknown>>('post', `/payment_intents/${paymentIntentId}/cancel`, data);
  }

  /**
   * List payment intents
   * @param params Pagination parameters
   */
  async listPaymentIntents(params?: StripePaginationParams & {
    customer?: string;
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
  }) {
    return this.request<Record<string, unknown>>('get', '/payment_intents', undefined, params);
  }

  // Products endpoints

  /**
   * Create a product
   * @param data Product data
   */
  async createProduct(data: {
    name: string;
    description?: string;
    active?: boolean;
    metadata?: Record<string, string>;
    images?: string[];
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/products', data);
  }

  /**
   * Retrieve a product
   * @param productId Product ID
   */
  async getProduct(productId: string) {
    return this.request<Record<string, unknown>>('get', `/products/${productId}`);
  }

  /**
   * Update a product
   * @param productId Product ID
   * @param data Update data
   */
  async updateProduct(productId: string, data: {
    name?: string;
    description?: string;
    active?: boolean;
    metadata?: Record<string, string>;
    images?: string[];
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', `/products/${productId}`, data);
  }

  /**
   * Delete a product
   * @param productId Product ID
   */
  async deleteProduct(productId: string) {
    return this.request<Record<string, unknown>>('delete', `/products/${productId}`);
  }

  /**
   * List products
   * @param params Pagination parameters
   */
  async listProducts(params?: StripePaginationParams & {
    active?: boolean;
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
    ids?: string[];
    url?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/products', undefined, params);
  }

  // Prices endpoints

  /**
   * Create a price
   * @param data Price data
   */
  async createPrice(data: {
    unit_amount: number;
    currency: string;
    product: string;
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number;
      usage_type?: 'metered' | 'licensed';
    };
    metadata?: Record<string, string>;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/prices', data);
  }

  /**
   * Retrieve a price
   * @param priceId Price ID
   */
  async getPrice(priceId: string) {
    return this.request<Record<string, unknown>>('get', `/prices/${priceId}`);
  }

  /**
   * Update a price
   * @param priceId Price ID
   * @param data Update data
   */
  async updatePrice(priceId: string, data: {
    nickname?: string;
    metadata?: Record<string, string>;
    active?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', `/prices/${priceId}`, data);
  }

  /**
   * List prices
   * @param params Pagination parameters
   */
  async listPrices(params?: StripePaginationParams & {
    active?: boolean;
    currency?: string;
    product?: string;
    type?: 'one_time' | 'recurring';
  }) {
    return this.request<Record<string, unknown>>('get', '/prices', undefined, params);
  }

  // Subscriptions endpoints

  /**
   * Create a subscription
   * @param data Subscription data
   */
  async createSubscription(data: {
    customer: string;
    items: Array<{
      price: string;
      quantity?: number;
    }>;
    billing_cycle_anchor?: number;
    cancel_at?: number;
    cancel_at_period_end?: boolean;
    default_payment_method?: string;
    metadata?: Record<string, string>;
    trial_end?: number;
    trial_period_days?: number;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/subscriptions', data);
  }

  /**
   * Retrieve a subscription
   * @param subscriptionId Subscription ID
   */
  async getSubscription(subscriptionId: string) {
    return this.request<Record<string, unknown>>('get', `/subscriptions/${subscriptionId}`);
  }

  /**
   * Update a subscription
   * @param subscriptionId Subscription ID
   * @param data Update data
   */
  async updateSubscription(subscriptionId: string, data: {
    cancel_at?: number;
    cancel_at_period_end?: boolean;
    items?: Array<{
      id?: string;
      price?: string;
      quantity?: number;
    }>;
    metadata?: Record<string, string>;
    proration_behavior?: 'create_prorations' | 'none';
    trial_end?: number | 'now';
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', `/subscriptions/${subscriptionId}`, data);
  }

  /**
   * Cancel a subscription
   * @param subscriptionId Subscription ID
   * @param data Cancellation data
   */
  async cancelSubscription(subscriptionId: string, data?: {
    cancel_at_period_end?: boolean;
    prorate?: boolean;
    invoice_now?: boolean;
  }) {
    return this.request<Record<string, unknown>>('delete', `/subscriptions/${subscriptionId}`, data);
  }

  /**
   * List subscriptions
   * @param params Pagination parameters
   */
  async listSubscriptions(params?: StripePaginationParams & {
    customer?: string;
    price?: string;
    status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'all';
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
  }) {
    return this.request<Record<string, unknown>>('get', '/subscriptions', undefined, params);
  }

  // Invoices endpoints

  /**
   * Create an invoice
   * @param data Invoice data
   */
  async createInvoice(data: {
    customer: string;
    auto_advance?: boolean;
    collection_method?: 'charge_automatically' | 'send_invoice';
    description?: string;
    metadata?: Record<string, string>;
    subscription?: string;
    days_until_due?: number;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/invoices', data);
  }

  /**
   * Retrieve an invoice
   * @param invoiceId Invoice ID
   */
  async getInvoice(invoiceId: string) {
    return this.request<Record<string, unknown>>('get', `/invoices/${invoiceId}`);
  }

  /**
   * Update an invoice
   * @param invoiceId Invoice ID
   * @param data Update data
   */
  async updateInvoice(invoiceId: string, data: {
    auto_advance?: boolean;
    collection_method?: 'charge_automatically' | 'send_invoice';
    description?: string;
    metadata?: Record<string, string>;
    days_until_due?: number;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', `/invoices/${invoiceId}`, data);
  }

  /**
   * Delete an invoice
   * @param invoiceId Invoice ID
   */
  async deleteInvoice(invoiceId: string) {
    return this.request<Record<string, unknown>>('delete', `/invoices/${invoiceId}`);
  }

  /**
   * Finalize an invoice
   * @param invoiceId Invoice ID
   * @param data Finalization data
   */
  async finalizeInvoice(invoiceId: string, data?: {
    auto_advance?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', `/invoices/${invoiceId}/finalize`, data);
  }

  /**
   * Pay an invoice
   * @param invoiceId Invoice ID
   * @param data Payment data
   */
  async payInvoice(invoiceId: string, data?: {
    source?: string;
    payment_method?: string;
    paid_out_of_band?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', `/invoices/${invoiceId}/pay`, data);
  }

  /**
   * List invoices
   * @param params Pagination parameters
   */
  async listInvoices(params?: StripePaginationParams & {
    customer?: string;
    subscription?: string;
    status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
  }) {
    return this.request<Record<string, unknown>>('get', '/invoices', undefined, params);
  }

  // Refunds endpoints

  /**
   * Create a refund
   * @param data Refund data
   */
  async createRefund(data: {
    charge?: string;
    payment_intent?: string;
    amount?: number;
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    metadata?: Record<string, string>;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/refunds', data);
  }

  /**
   * Retrieve a refund
   * @param refundId Refund ID
   */
  async getRefund(refundId: string) {
    return this.request<Record<string, unknown>>('get', `/refunds/${refundId}`);
  }

  /**
   * Update a refund
   * @param refundId Refund ID
   * @param data Update data
   */
  async updateRefund(refundId: string, data: {
    metadata?: Record<string, string>;
  }) {
    return this.request<Record<string, unknown>>('post', `/refunds/${refundId}`, data);
  }

  /**
   * List refunds
   * @param params Pagination parameters
   */
  async listRefunds(params?: StripePaginationParams & {
    charge?: string;
    payment_intent?: string;
    created?: number | { gt?: number; gte?: number; lt?: number; lte?: number };
  }) {
    return this.request<Record<string, unknown>>('get', '/refunds', undefined, params);
  }

  // Webhook endpoints

  /**
   * Create a webhook endpoint
   * @param data Webhook data
   */
  async createWebhook(data: {
    url: string;
    enabled_events: string[];
    description?: string;
    metadata?: Record<string, string>;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', '/webhook_endpoints', data);
  }

  /**
   * Retrieve a webhook endpoint
   * @param webhookId Webhook ID
   */
  async getWebhook(webhookId: string) {
    return this.request<Record<string, unknown>>('get', `/webhook_endpoints/${webhookId}`);
  }

  /**
   * Update a webhook endpoint
   * @param webhookId Webhook ID
   * @param data Update data
   */
  async updateWebhook(webhookId: string, data: {
    url?: string;
    enabled_events?: string[];
    description?: string;
    metadata?: Record<string, string>;
    [key: string]: any;
  }) {
    return this.request<Record<string, unknown>>('post', `/webhook_endpoints/${webhookId}`, data);
  }

  /**
   * Delete a webhook endpoint
   * @param webhookId Webhook ID
   */
  async deleteWebhook(webhookId: string) {
    return this.request<Record<string, unknown>>('delete', `/webhook_endpoints/${webhookId}`);
  }

  /**
   * List webhook endpoints
   * @param params Pagination parameters
   */
  async listWebhooks(params?: StripePaginationParams) {
    return this.request<Record<string, unknown>>('get', '/webhook_endpoints', undefined, params);
  }
}


