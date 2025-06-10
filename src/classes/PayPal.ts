import axios from 'axios';
import PayPalAuthOptions from '../interfaces/PayPal/PayPalAuthOptions';
import PayPalPaginationParams from '../interfaces/PayPal/PayPalPaginationParams';

/**
 * Complete PayPal API wrapper for interacting with all PayPal endpoints
 */
export class PayPalAPI {
  private clientId: string;
  private clientSecret: string;
  private sandbox: boolean;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl: string;
  
  /**
   * Create a new PayPal API client
   * @param options Authentication options
   */
  constructor(options: PayPalAuthOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.sandbox = options.sandbox || false;
    this.baseUrl = this.sandbox 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com';
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await axios({
      method: 'post',
      url: `${this.baseUrl}/v1/oauth2/token`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: 'grant_type=client_credentials'
    });
    
    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    return this.accessToken as string;
  }

  /**
   * Make a request to the PayPal API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Optional request body
   * @param params Optional query parameters
   */
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await axios({
      method,
      url: `${this.baseUrl}${endpoint}`,
      data,
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }

  // Orders endpoints

  /**
   * Create an order
   * @param data Order data
   */
  async createOrder(data: {
    intent: 'CAPTURE' | 'AUTHORIZE';
    purchase_units: Array<{
      amount: {
        currency_code: string;
        value: string;
        breakdown?: {
          item_total?: { currency_code: string; value: string };
          shipping?: { currency_code: string; value: string };
          tax_total?: { currency_code: string; value: string };
          discount?: { currency_code: string; value: string };
        };
      };
      reference_id?: string;
      description?: string;
      custom_id?: string;
      invoice_id?: string;
      items?: Array<{
        name: string;
        quantity: string;
        unit_amount: { currency_code: string; value: string };
        description?: string;
        sku?: string;
        category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS' | 'DONATION';
      }>;
      shipping?: {
        address?: {
          address_line_1?: string;
          address_line_2?: string;
          admin_area_1?: string;
          admin_area_2?: string;
          postal_code?: string;
          country_code: string;
        };
        name?: { full_name?: string };
      };
    }>;
    application_context?: {
      brand_name?: string;
      locale?: string;
      landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
      shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
      user_action?: 'CONTINUE' | 'PAY_NOW';
      return_url?: string;
      cancel_url?: string;
    };
  }) {
    return this.request<Record<string, unknown>>('post', '/v2/checkout/orders', data);
  }

  /**
   * Get order details
   * @param orderId Order ID
   */
  async getOrder(orderId: string) {
    return this.request<Record<string, unknown>>('get', `/v2/checkout/orders/${orderId}`);
  }

  /**
   * Update order
   * @param orderId Order ID
   * @param data Patch operations
   */
  async updateOrder(orderId: string, data: Array<{
    op: 'add' | 'replace' | 'remove';
    path: string;
    value?: any;
  }>) {
    return this.request<Record<string, unknown>>('patch', `/v2/checkout/orders/${orderId}`, data);
  }

  /**
   * Authorize payment for order
   * @param orderId Order ID
   * @param data Optional data
   */
  async authorizeOrder(orderId: string, data?: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('post', `/v2/checkout/orders/${orderId}/authorize`, data || {});
  }

  /**
   * Capture payment for order
   * @param orderId Order ID
   * @param data Optional data
   */
  async captureOrder(orderId: string, data?: Record<string, unknown>) {
    return this.request<Record<string, unknown>>('post', `/v2/checkout/orders/${orderId}/capture`, data || {});
  }

  // Payment endpoints

  /**
   * Show payment details
   * @param paymentId Payment ID
   */
  async getPayment(paymentId: string) {
    return this.request<Record<string, unknown>>('get', `/v2/payments/captures/${paymentId}`);
  }

  /**
   * Refund captured payment
   * @param captureId Capture ID
   * @param data Refund data
   */
  async refundPayment(captureId: string, data?: {
    amount?: {
      value: string;
      currency_code: string;
    };
    invoice_id?: string;
    note_to_payer?: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/v2/payments/captures/${captureId}/refund`, data || {});
  }

  /**
   * Get refund details
   * @param refundId Refund ID
   */
  async getRefund(refundId: string) {
    return this.request<Record<string, unknown>>('get', `/v2/payments/refunds/${refundId}`);
  }

  /**
   * Get authorized payment details
   * @param authorizationId Authorization ID
   */
  async getAuthorization(authorizationId: string) {
    return this.request<Record<string, unknown>>('get', `/v2/payments/authorizations/${authorizationId}`);
  }

  /**
   * Capture authorized payment
   * @param authorizationId Authorization ID
   * @param data Capture data
   */
  async captureAuthorization(authorizationId: string, data?: {
    amount?: {
      value: string;
      currency_code: string;
    };
    invoice_id?: string;
    final_capture?: boolean;
    note_to_payer?: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/v2/payments/authorizations/${authorizationId}/capture`, data || {});
  }

  /**
   * Void authorized payment
   * @param authorizationId Authorization ID
   */
  async voidAuthorization(authorizationId: string) {
    return this.request<Record<string, unknown>>('post', `/v2/payments/authorizations/${authorizationId}/void`);
  }

  // Invoicing endpoints

  /**
   * Generate invoice number
   */
  async generateInvoiceNumber() {
    return this.request<Record<string, unknown>>('post', '/v2/invoicing/generate-next-invoice-number');
  }

  /**
   * Create draft invoice
   * @param data Invoice data
   */
  async createInvoice(data: {
    detail: {
      invoice_number?: string;
      reference?: string;
      invoice_date?: string;
      currency_code: string;
      note?: string;
      term?: string;
      memo?: string;
      payment_term?: {
        term_type: 'DUE_ON_RECEIPT' | 'DUE_ON_DATE_SPECIFIED' | 'NET_10' | 'NET_15' | 'NET_30' | 'NET_45' | 'NET_60' | 'NET_90';
        due_date?: string;
      };
    };
    invoicer?: {
      name?: {
        given_name?: string;
        surname?: string;
      };
      address?: {
        address_line_1?: string;
        address_line_2?: string;
        admin_area_1?: string;
        admin_area_2?: string;
        postal_code?: string;
        country_code: string;
      };
      email_address?: string;
      phones?: Array<{
        phone_type: 'FAX' | 'HOME' | 'MOBILE' | 'OTHER' | 'PAGER';
        phone_number: {
          national_number: string;
        };
      }>;
      website?: string;
      tax_id?: string;
      logo_url?: string;
    };
    primary_recipients: Array<{
      billing_info: {
        name?: {
          given_name?: string;
          surname?: string;
        };
        address?: {
          address_line_1?: string;
          address_line_2?: string;
          admin_area_1?: string;
          admin_area_2?: string;
          postal_code?: string;
          country_code: string;
        };
        email_address?: string;
      };
      shipping_info?: {
        name?: {
          given_name?: string;
          surname?: string;
        };
        address?: {
          address_line_1?: string;
          address_line_2?: string;
          admin_area_1?: string;
          admin_area_2?: string;
          postal_code?: string;
          country_code: string;
        };
      };
    }>;
    items: Array<{
      name: string;
      description?: string;
      quantity: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
      tax?: {
        name?: string;
        percent?: string;
      };
      discount?: {
        percent?: string;
      };
      unit_of_measure?: string;
    }>;
    configuration?: {
      partial_payment?: {
        allow_partial_payment?: boolean;
        minimum_amount_due?: {
          currency_code: string;
          value: string;
        };
      };
      allow_tip?: boolean;
      tax_calculated_after_discount?: boolean;
      tax_inclusive?: boolean;
    };
    amount?: {
      breakdown?: {
        custom?: {
          label: string;
          amount: {
            currency_code: string;
            value: string;
          };
        };
        shipping?: {
          amount: {
            currency_code: string;
            value: string;
          };
          tax?: {
            name?: string;
            percent?: string;
          };
        };
        discount?: {
          invoice_discount?: {
            percent?: string;
            amount?: {
              currency_code: string;
              value: string;
            };
          };
        };
      };
    };
  }) {
    return this.request<Record<string, unknown>>('post', '/v2/invoicing/invoices', data);
  }

  /**
   * Get invoice details
   * @param invoiceId Invoice ID
   */
  async getInvoice(invoiceId: string) {
    return this.request<Record<string, unknown>>('get', `/v2/invoicing/invoices/${invoiceId}`);
  }

  /**
   * Update invoice
   * @param invoiceId Invoice ID
   * @param data Invoice data (same as createInvoice)
   */
  async updateInvoice(invoiceId: string, data: any) {
    return this.request<Record<string, unknown>>('put', `/v2/invoicing/invoices/${invoiceId}`, data);
  }

  /**
   * Delete invoice
   * @param invoiceId Invoice ID
   */
  async deleteInvoice(invoiceId: string) {
    return this.request<Record<string, unknown>>('delete', `/v2/invoicing/invoices/${invoiceId}`);
  }

  /**
   * Send invoice
   * @param invoiceId Invoice ID
   * @param data Additional data
   */
  async sendInvoice(invoiceId: string, data?: {
    send_to_recipient?: boolean;
    send_to_invoicer?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', `/v2/invoicing/invoices/${invoiceId}/send`, data || {});
  }

  /**
   * Search invoices
   * @param data Search parameters
   */
  async searchInvoices(data: {
    total_amount_range?: {
      lower_amount?: {
        currency_code: string;
        value: string;
      };
      upper_amount?: {
        currency_code: string;
        value: string;
      };
    };
    invoice_date_range?: {
      start?: string;
      end?: string;
    };
    due_date_range?: {
      start?: string;
      end?: string;
    };
    payment_date_range?: {
      start?: string;
      end?: string;
    };
    invoice_number?: string;
    status?: 'DRAFT' | 'SENT' | 'PAID' | 'MARKED_AS_PAID' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_PAID' | 'PARTIALLY_REFUNDED' | 'MARKED_AS_REFUNDED';
    reference?: string;
    memo?: string;
    fields?: string[];
    page?: number;
    page_size?: number;
    total_required?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', '/v2/invoicing/search-invoices', data);
  }

  // Subscriptions endpoints

  /**
   * Create subscription plan
   * @param data Plan data
   */
  async createPlan(data: {
    product_id: string;
    name: string;
    description?: string;
    billing_cycles: Array<{
      tenure_type: 'REGULAR' | 'TRIAL';
      sequence: number;
      total_cycles?: number;
      pricing_scheme: {
        fixed_price: {
          value: string;
          currency_code: string;
        };
      };
      frequency: {
        interval_unit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
        interval_count: number;
      };
    }>;
    payment_preferences?: {
      auto_bill_outstanding?: boolean;
      setup_fee?: {
        value: string;
        currency_code: string;
      };
      setup_fee_failure_action?: 'CONTINUE' | 'CANCEL';
      payment_failure_threshold?: number;
    };
    taxes?: {
      percentage: string;
      inclusive?: boolean;
    };
    quantity_supported?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', '/v1/billing/plans', data);
  }

  /**
   * Get plan details
   * @param planId Plan ID
   */
  async getPlan(planId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/billing/plans/${planId}`);
  }

  /**
   * Update plan
   * @param planId Plan ID
   * @param data Patch operations
   */
  async updatePlan(planId: string, data: Array<{
    op: 'replace';
    path: string;
    value: any;
  }>) {
    return this.request<Record<string, unknown>>('patch', `/v1/billing/plans/${planId}`, data);
  }

  /**
   * List plans
   * @param params Query parameters
   */
  async listPlans(params?: PayPalPaginationParams & {
    product_id?: string;
    plan_ids?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/v1/billing/plans', undefined, params);
  }

  /**
   * Create product
   * @param data Product data
   */
  async createProduct(data: {
    name: string;
    description?: string;
    type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
    category?: string;
    image_url?: string;
    home_url?: string;
  }) {
    return this.request<Record<string, unknown>>('post', '/v1/catalogs/products', data);
  }

  /**
   * Get product details
   * @param productId Product ID
   */
  async getProduct(productId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/catalogs/products/${productId}`);
  }

  /**
   * List products
   * @param params Query parameters
   */
  async listProducts(params?: PayPalPaginationParams) {
    return this.request<Record<string, unknown>>('get', '/v1/catalogs/products', undefined, params);
  }

  /**
   * Create subscription
   * @param data Subscription data
   */
  async createSubscription(data: {
    plan_id: string;
    start_time?: string;
    quantity?: string;
    shipping_amount?: {
      currency_code: string;
      value: string;
    };
    subscriber: {
      name?: {
        given_name: string;
        surname: string;
      };
      email_address: string;
      shipping_address?: {
        name?: {
          full_name?: string;
        };
        address?: {
          address_line_1: string;
          address_line_2?: string;
          admin_area_2?: string;
          admin_area_1?: string;
          postal_code?: string;
          country_code: string;
        };
      };
      payment_source?: {
        card?: {
          number: string;
          expiry: string;
          security_code: string;
          name: string;
          billing_address?: {
            address_line_1: string;
            address_line_2?: string;
            admin_area_2?: string;
            admin_area_1?: string;
            postal_code?: string;
            country_code: string;
          };
        };
      };
    };
    application_context?: {
      brand_name?: string;
      locale?: string;
      shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
      user_action?: 'SUBSCRIBE_NOW' | 'CONTINUE';
      payment_method?: {
        payer_selected?: 'PAYPAL' | 'PAYPAL_CREDIT';
        payee_preferred?: 'IMMEDIATE_PAYMENT_REQUIRED' | 'UNRESTRICTED';
      };
      return_url?: string;
      cancel_url?: string;
    };
  }) {
    return this.request<Record<string, unknown>>('post', '/v1/billing/subscriptions', data);
  }

  /**
   * Get subscription details
   * @param subscriptionId Subscription ID
   */
  async getSubscription(subscriptionId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/billing/subscriptions/${subscriptionId}`);
  }

  /**
   * Update subscription
   * @param subscriptionId Subscription ID
   * @param data Patch operations
   */
  async updateSubscription(subscriptionId: string, data: Array<{
    op: 'replace' | 'add';
    path: string;
    value: any;
  }>) {
    return this.request<Record<string, unknown>>('patch', `/v1/billing/subscriptions/${subscriptionId}`, data);
  }

  /**
   * Suspend subscription
   * @param subscriptionId Subscription ID
   * @param reason Reason for suspension
   */
  async suspendSubscription(subscriptionId: string, reason: string) {
    return this.request<Record<string, unknown>>('post', `/v1/billing/subscriptions/${subscriptionId}/suspend`, { reason });
  }

  /**
   * Activate subscription
   * @param subscriptionId Subscription ID
   * @param reason Reason for activation
   */
  async activateSubscription(subscriptionId: string, reason: string) {
    return this.request<Record<string, unknown>>('post', `/v1/billing/subscriptions/${subscriptionId}/activate`, { reason });
  }

  /**
   * Cancel subscription
   * @param subscriptionId Subscription ID
   * @param reason Reason for cancellation
   */
  async cancelSubscription(subscriptionId: string, reason: string) {
    return this.request<Record<string, unknown>>('post', `/v1/billing/subscriptions/${subscriptionId}/cancel`, { reason });
  }

  // Disputes endpoints

  /**
   * List disputes
   * @param params Query parameters
   */
  async listDisputes(params?: {
    start_time?: string;
    end_time?: string;
    disputed_transaction_id?: string;
    reason?: string;
    status?: string;
    page_size?: number;
    next_page_token?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/v1/customer/disputes', undefined, params);
  }

  /**
   * Get dispute details
   * @param disputeId Dispute ID
   */
  async getDispute(disputeId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/customer/disputes/${disputeId}`);
  }

  // Payouts endpoints

  /**
   * Create payout
   * @param data Payout data
   */
  async createPayout(data: {
    sender_batch_header: {
      sender_batch_id: string;
      recipient_type?: 'EMAIL' | 'PHONE' | 'PAYPAL_ID';
      email_subject?: string;
      email_message?: string;
    };
    items: Array<{
      recipient_type?: 'EMAIL' | 'PHONE' | 'PAYPAL_ID';
      amount: {
        value: string;
        currency: string;
      };
      note?: string;
      receiver: string;
      sender_item_id?: string;
    }>;
  }) {
    return this.request<Record<string, unknown>>('post', '/v1/payments/payouts', data);
  }

  /**
   * Get payout details
   * @param payoutBatchId Payout batch ID
   */
  async getPayout(payoutBatchId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/payments/payouts/${payoutBatchId}`);
  }

  /**
   * Get payout item details
   * @param payoutItemId Payout item ID
   */
  async getPayoutItem(payoutItemId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/payments/payouts-item/${payoutItemId}`);
  }

  /**
   * Cancel unclaimed payout item
   * @param payoutItemId Payout item ID
   */
  async cancelPayoutItem(payoutItemId: string) {
    return this.request<Record<string, unknown>>('post', `/v1/payments/payouts-item/${payoutItemId}/cancel`);
  }

  // Webhooks endpoints

  /**
   * Create webhook
   * @param data Webhook data
   */
  async createWebhook(data: {
    url: string;
    event_types: Array<{
      name: string;
    }>;
  }) {
    return this.request<Record<string, unknown>>('post', '/v1/notifications/webhooks', data);
  }

  /**
   * Get webhook details
   * @param webhookId Webhook ID
   */
  async getWebhook(webhookId: string) {
    return this.request<Record<string, unknown>>('get', `/v1/notifications/webhooks/${webhookId}`);
  }

  /**
   * List webhooks
   */
  async listWebhooks() {
    return this.request<Record<string, unknown>>('get', '/v1/notifications/webhooks');
  }

  /**
   * Update webhook
   * @param webhookId Webhook ID
   * @param data Patch operations
   */
  async updateWebhook(webhookId: string, data: Array<{
    op: 'add' | 'replace' | 'remove';
    path: string;
    value?: any;
  }>) {
    return this.request<Record<string, unknown>>('patch', `/v1/notifications/webhooks/${webhookId}`, data);
  }

  /**
   * Delete webhook
   * @param webhookId Webhook ID
   */
  async deleteWebhook(webhookId: string) {
    return this.request<Record<string, unknown>>('delete', `/v1/notifications/webhooks/${webhookId}`);
  }

  /**
   * List event types for webhooks
   */
  async listEventTypes() {
    return this.request<Record<string, unknown>>('get', '/v1/notifications/webhooks-event-types');
  }

  /**
   * Verify webhook signature
   * @param data Verification data
   */
  async verifyWebhookSignature(data: {
    auth_algo: string;
    cert_url: string;
    transmission_id: string;
    transmission_sig: string;
    transmission_time: string;
    webhook_id: string;
    webhook_event: Record<string, unknown>;
  }) {
    return this.request<Record<string, unknown>>('post', '/v1/notifications/verify-webhook-signature', data);
  }
}



