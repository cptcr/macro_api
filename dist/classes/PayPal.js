"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayPalAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Complete PayPal API wrapper for interacting with all PayPal endpoints
 */
class PayPalAPI {
    /**
     * Create a new PayPal API client
     * @param options Authentication options
     */
    constructor(options) {
        this.accessToken = null;
        this.tokenExpiry = 0;
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
    async getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await (0, axios_1.default)({
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
        return this.accessToken;
    }
    /**
     * Make a request to the PayPal API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    async request(method, endpoint, data, params) {
        const token = await this.getAccessToken();
        const response = await (0, axios_1.default)({
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
    async createOrder(data) {
        return this.request('post', '/v2/checkout/orders', data);
    }
    /**
     * Get order details
     * @param orderId Order ID
     */
    async getOrder(orderId) {
        return this.request('get', `/v2/checkout/orders/${orderId}`);
    }
    /**
     * Update order
     * @param orderId Order ID
     * @param data Patch operations
     */
    async updateOrder(orderId, data) {
        return this.request('patch', `/v2/checkout/orders/${orderId}`, data);
    }
    /**
     * Authorize payment for order
     * @param orderId Order ID
     * @param data Optional data
     */
    async authorizeOrder(orderId, data) {
        return this.request('post', `/v2/checkout/orders/${orderId}/authorize`, data || {});
    }
    /**
     * Capture payment for order
     * @param orderId Order ID
     * @param data Optional data
     */
    async captureOrder(orderId, data) {
        return this.request('post', `/v2/checkout/orders/${orderId}/capture`, data || {});
    }
    // Payment endpoints
    /**
     * Show payment details
     * @param paymentId Payment ID
     */
    async getPayment(paymentId) {
        return this.request('get', `/v2/payments/captures/${paymentId}`);
    }
    /**
     * Refund captured payment
     * @param captureId Capture ID
     * @param data Refund data
     */
    async refundPayment(captureId, data) {
        return this.request('post', `/v2/payments/captures/${captureId}/refund`, data || {});
    }
    /**
     * Get refund details
     * @param refundId Refund ID
     */
    async getRefund(refundId) {
        return this.request('get', `/v2/payments/refunds/${refundId}`);
    }
    /**
     * Get authorized payment details
     * @param authorizationId Authorization ID
     */
    async getAuthorization(authorizationId) {
        return this.request('get', `/v2/payments/authorizations/${authorizationId}`);
    }
    /**
     * Capture authorized payment
     * @param authorizationId Authorization ID
     * @param data Capture data
     */
    async captureAuthorization(authorizationId, data) {
        return this.request('post', `/v2/payments/authorizations/${authorizationId}/capture`, data || {});
    }
    /**
     * Void authorized payment
     * @param authorizationId Authorization ID
     */
    async voidAuthorization(authorizationId) {
        return this.request('post', `/v2/payments/authorizations/${authorizationId}/void`);
    }
    // Invoicing endpoints
    /**
     * Generate invoice number
     */
    async generateInvoiceNumber() {
        return this.request('post', '/v2/invoicing/generate-next-invoice-number');
    }
    /**
     * Create draft invoice
     * @param data Invoice data
     */
    async createInvoice(data) {
        return this.request('post', '/v2/invoicing/invoices', data);
    }
    /**
     * Get invoice details
     * @param invoiceId Invoice ID
     */
    async getInvoice(invoiceId) {
        return this.request('get', `/v2/invoicing/invoices/${invoiceId}`);
    }
    /**
     * Update invoice
     * @param invoiceId Invoice ID
     * @param data Invoice data (same as createInvoice)
     */
    async updateInvoice(invoiceId, data) {
        return this.request('put', `/v2/invoicing/invoices/${invoiceId}`, data);
    }
    /**
     * Delete invoice
     * @param invoiceId Invoice ID
     */
    async deleteInvoice(invoiceId) {
        return this.request('delete', `/v2/invoicing/invoices/${invoiceId}`);
    }
    /**
     * Send invoice
     * @param invoiceId Invoice ID
     * @param data Additional data
     */
    async sendInvoice(invoiceId, data) {
        return this.request('post', `/v2/invoicing/invoices/${invoiceId}/send`, data || {});
    }
    /**
     * Search invoices
     * @param data Search parameters
     */
    async searchInvoices(data) {
        return this.request('post', '/v2/invoicing/search-invoices', data);
    }
    // Subscriptions endpoints
    /**
     * Create subscription plan
     * @param data Plan data
     */
    async createPlan(data) {
        return this.request('post', '/v1/billing/plans', data);
    }
    /**
     * Get plan details
     * @param planId Plan ID
     */
    async getPlan(planId) {
        return this.request('get', `/v1/billing/plans/${planId}`);
    }
    /**
     * Update plan
     * @param planId Plan ID
     * @param data Patch operations
     */
    async updatePlan(planId, data) {
        return this.request('patch', `/v1/billing/plans/${planId}`, data);
    }
    /**
     * List plans
     * @param params Query parameters
     */
    async listPlans(params) {
        return this.request('get', '/v1/billing/plans', undefined, params);
    }
    /**
     * Create product
     * @param data Product data
     */
    async createProduct(data) {
        return this.request('post', '/v1/catalogs/products', data);
    }
    /**
     * Get product details
     * @param productId Product ID
     */
    async getProduct(productId) {
        return this.request('get', `/v1/catalogs/products/${productId}`);
    }
    /**
     * List products
     * @param params Query parameters
     */
    async listProducts(params) {
        return this.request('get', '/v1/catalogs/products', undefined, params);
    }
    /**
     * Create subscription
     * @param data Subscription data
     */
    async createSubscription(data) {
        return this.request('post', '/v1/billing/subscriptions', data);
    }
    /**
     * Get subscription details
     * @param subscriptionId Subscription ID
     */
    async getSubscription(subscriptionId) {
        return this.request('get', `/v1/billing/subscriptions/${subscriptionId}`);
    }
    /**
     * Update subscription
     * @param subscriptionId Subscription ID
     * @param data Patch operations
     */
    async updateSubscription(subscriptionId, data) {
        return this.request('patch', `/v1/billing/subscriptions/${subscriptionId}`, data);
    }
    /**
     * Suspend subscription
     * @param subscriptionId Subscription ID
     * @param reason Reason for suspension
     */
    async suspendSubscription(subscriptionId, reason) {
        return this.request('post', `/v1/billing/subscriptions/${subscriptionId}/suspend`, { reason });
    }
    /**
     * Activate subscription
     * @param subscriptionId Subscription ID
     * @param reason Reason for activation
     */
    async activateSubscription(subscriptionId, reason) {
        return this.request('post', `/v1/billing/subscriptions/${subscriptionId}/activate`, { reason });
    }
    /**
     * Cancel subscription
     * @param subscriptionId Subscription ID
     * @param reason Reason for cancellation
     */
    async cancelSubscription(subscriptionId, reason) {
        return this.request('post', `/v1/billing/subscriptions/${subscriptionId}/cancel`, { reason });
    }
    // Disputes endpoints
    /**
     * List disputes
     * @param params Query parameters
     */
    async listDisputes(params) {
        return this.request('get', '/v1/customer/disputes', undefined, params);
    }
    /**
     * Get dispute details
     * @param disputeId Dispute ID
     */
    async getDispute(disputeId) {
        return this.request('get', `/v1/customer/disputes/${disputeId}`);
    }
    // Payouts endpoints
    /**
     * Create payout
     * @param data Payout data
     */
    async createPayout(data) {
        return this.request('post', '/v1/payments/payouts', data);
    }
    /**
     * Get payout details
     * @param payoutBatchId Payout batch ID
     */
    async getPayout(payoutBatchId) {
        return this.request('get', `/v1/payments/payouts/${payoutBatchId}`);
    }
    /**
     * Get payout item details
     * @param payoutItemId Payout item ID
     */
    async getPayoutItem(payoutItemId) {
        return this.request('get', `/v1/payments/payouts-item/${payoutItemId}`);
    }
    /**
     * Cancel unclaimed payout item
     * @param payoutItemId Payout item ID
     */
    async cancelPayoutItem(payoutItemId) {
        return this.request('post', `/v1/payments/payouts-item/${payoutItemId}/cancel`);
    }
    // Webhooks endpoints
    /**
     * Create webhook
     * @param data Webhook data
     */
    async createWebhook(data) {
        return this.request('post', '/v1/notifications/webhooks', data);
    }
    /**
     * Get webhook details
     * @param webhookId Webhook ID
     */
    async getWebhook(webhookId) {
        return this.request('get', `/v1/notifications/webhooks/${webhookId}`);
    }
    /**
     * List webhooks
     */
    async listWebhooks() {
        return this.request('get', '/v1/notifications/webhooks');
    }
    /**
     * Update webhook
     * @param webhookId Webhook ID
     * @param data Patch operations
     */
    async updateWebhook(webhookId, data) {
        return this.request('patch', `/v1/notifications/webhooks/${webhookId}`, data);
    }
    /**
     * Delete webhook
     * @param webhookId Webhook ID
     */
    async deleteWebhook(webhookId) {
        return this.request('delete', `/v1/notifications/webhooks/${webhookId}`);
    }
    /**
     * List event types for webhooks
     */
    async listEventTypes() {
        return this.request('get', '/v1/notifications/webhooks-event-types');
    }
    /**
     * Verify webhook signature
     * @param data Verification data
     */
    async verifyWebhookSignature(data) {
        return this.request('post', '/v1/notifications/verify-webhook-signature', data);
    }
}
exports.PayPalAPI = PayPalAPI;
