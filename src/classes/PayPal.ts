import axios from 'axios';
import PayPalAuthOptions from '../interfaces/PayPal/PayPalAuthOptions';
import PayPalPaginationParams from '../interfaces/PayPal/PayPalPaginationParams';
import { toPaginationParams, toRequestData } from '../utils/errorHandling';

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
    data?: Record<string, unknown> | FormData,
    params?: Record<string, unknown>
  ): Promise<T> {
    const token = await this.getAccessToken();
    
    const response = await axios({
      method,
      url: `${this.baseUrl}${endpoint}`,
      data,
      params: toPaginationParams(params),
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
    value?: unknown;
  }>) {
    return this.request<Record<string, unknown>>('patch', `/v2/checkout/orders/${orderId}`, toRequestData(data));
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
  async updateInvoice(invoiceId: string, data: Parameters<PayPalAPI['createInvoice']>[0]) {
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
    status?: 'DRAFT' | 'SENT' | 'SCHEDULED' | 'PAID' | 'MARKED_AS_PAID' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_PAID' | 'PARTIALLY_REFUNDED' | 'MARKED_AS_REFUNDED' | 'UNPAID' | 'PAYMENT_PENDING';
    reference?: string;
    recipient_email?: string;
    recipient_business_name?: string;
    recipient_first_name?: string;
    recipient_last_name?: string;
    memo?: string;
    currency_code?: string;
    archived?: boolean;
    fields?: string[];
    page?: number;
    page_size?: number;
    total_count_required?: boolean;
  }): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('post', '/v2/invoicing/search', data);
  }
}