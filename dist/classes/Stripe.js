"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Complete Stripe API wrapper for interacting with all Stripe endpoints
 */
class StripeAPI {
    /**
     * Create a new Stripe API client
     * @param options Authentication options
     */
    constructor(options) {
        this.baseUrl = 'https://api.stripe.com/v1';
        this.secretKey = options.secretKey;
    }
    /**
     * Make a request to the Stripe API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    async request(method, endpoint, data, params) {
        // Convert data to URLSearchParams for proper format if data exists and method is not get
        const formData = data && method !== 'get' ? new URLSearchParams(data) : data;
        const response = await (0, axios_1.default)({
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
        return this.request('get', '/balance');
    }
    /**
     * Get balance transaction by ID
     * @param transactionId Transaction ID
     */
    async getBalanceTransaction(transactionId) {
        return this.request('get', `/balance/history/${transactionId}`);
    }
    /**
     * List balance transactions
     * @param params Pagination parameters
     */
    async listBalanceTransactions(params) {
        return this.request('get', '/balance/history', undefined, params);
    }
    // Charges endpoints
    /**
     * Create a charge
     * @param data Charge data
     */
    async createCharge(data) {
        return this.request('post', '/charges', data);
    }
    /**
     * Retrieve a charge
     * @param chargeId Charge ID
     */
    async getCharge(chargeId) {
        return this.request('get', `/charges/${chargeId}`);
    }
    /**
     * Update a charge
     * @param chargeId Charge ID
     * @param data Update data
     */
    async updateCharge(chargeId, data) {
        return this.request('post', `/charges/${chargeId}`, data);
    }
    /**
     * Capture a charge
     * @param chargeId Charge ID
     * @param data Capture data
     */
    async captureCharge(chargeId, data) {
        return this.request('post', `/charges/${chargeId}/capture`, data);
    }
    /**
     * List charges
     * @param params Pagination parameters
     */
    async listCharges(params) {
        return this.request('get', '/charges', undefined, params);
    }
    // Customers endpoints
    /**
     * Create a customer
     * @param data Customer data
     */
    async createCustomer(data) {
        return this.request('post', '/customers', data);
    }
    /**
     * Retrieve a customer
     * @param customerId Customer ID
     */
    async getCustomer(customerId) {
        return this.request('get', `/customers/${customerId}`);
    }
    /**
     * Update a customer
     * @param customerId Customer ID
     * @param data Update data
     */
    async updateCustomer(customerId, data) {
        return this.request('post', `/customers/${customerId}`, data);
    }
    /**
     * Delete a customer
     * @param customerId Customer ID
     */
    async deleteCustomer(customerId) {
        return this.request('delete', `/customers/${customerId}`);
    }
    /**
     * List customers
     * @param params Pagination parameters
     */
    async listCustomers(params) {
        return this.request('get', '/customers', undefined, params);
    }
    // Payment Methods endpoints
    /**
     * Create a payment method
     * @param data Payment method data
     */
    async createPaymentMethod(data) {
        return this.request('post', '/payment_methods', data);
    }
    /**
     * Retrieve a payment method
     * @param paymentMethodId Payment method ID
     */
    async getPaymentMethod(paymentMethodId) {
        return this.request('get', `/payment_methods/${paymentMethodId}`);
    }
    /**
     * Update a payment method
     * @param paymentMethodId Payment method ID
     * @param data Update data
     */
    async updatePaymentMethod(paymentMethodId, data) {
        return this.request('post', `/payment_methods/${paymentMethodId}`, data);
    }
    /**
     * List payment methods
     * @param params Query parameters
     */
    async listPaymentMethods(params) {
        return this.request('get', '/payment_methods', undefined, params);
    }
    /**
     * Attach a payment method to a customer
     * @param paymentMethodId Payment method ID
     * @param data Attachment data
     */
    async attachPaymentMethod(paymentMethodId, data) {
        return this.request('post', `/payment_methods/${paymentMethodId}/attach`, data);
    }
    /**
     * Detach a payment method from a customer
     * @param paymentMethodId Payment method ID
     */
    async detachPaymentMethod(paymentMethodId) {
        return this.request('post', `/payment_methods/${paymentMethodId}/detach`);
    }
    // Payment Intents endpoints
    /**
     * Create a payment intent
     * @param data Payment intent data
     */
    async createPaymentIntent(data) {
        return this.request('post', '/payment_intents', data);
    }
    /**
     * Retrieve a payment intent
     * @param paymentIntentId Payment intent ID
     */
    async getPaymentIntent(paymentIntentId) {
        return this.request('get', `/payment_intents/${paymentIntentId}`);
    }
    /**
     * Update a payment intent
     * @param paymentIntentId Payment intent ID
     * @param data Update data
     */
    async updatePaymentIntent(paymentIntentId, data) {
        return this.request('post', `/payment_intents/${paymentIntentId}`, data);
    }
    /**
     * Confirm a payment intent
     * @param paymentIntentId Payment intent ID
     * @param data Confirmation data
     */
    async confirmPaymentIntent(paymentIntentId, data) {
        return this.request('post', `/payment_intents/${paymentIntentId}/confirm`, data);
    }
    /**
     * Cancel a payment intent
     * @param paymentIntentId Payment intent ID
     * @param data Cancellation data
     */
    async cancelPaymentIntent(paymentIntentId, data) {
        return this.request('post', `/payment_intents/${paymentIntentId}/cancel`, data);
    }
    /**
     * List payment intents
     * @param params Pagination parameters
     */
    async listPaymentIntents(params) {
        return this.request('get', '/payment_intents', undefined, params);
    }
    // Products endpoints
    /**
     * Create a product
     * @param data Product data
     */
    async createProduct(data) {
        return this.request('post', '/products', data);
    }
    /**
     * Retrieve a product
     * @param productId Product ID
     */
    async getProduct(productId) {
        return this.request('get', `/products/${productId}`);
    }
    /**
     * Update a product
     * @param productId Product ID
     * @param data Update data
     */
    async updateProduct(productId, data) {
        return this.request('post', `/products/${productId}`, data);
    }
    /**
     * Delete a product
     * @param productId Product ID
     */
    async deleteProduct(productId) {
        return this.request('delete', `/products/${productId}`);
    }
    /**
     * List products
     * @param params Pagination parameters
     */
    async listProducts(params) {
        return this.request('get', '/products', undefined, params);
    }
    // Prices endpoints
    /**
     * Create a price
     * @param data Price data
     */
    async createPrice(data) {
        return this.request('post', '/prices', data);
    }
    /**
     * Retrieve a price
     * @param priceId Price ID
     */
    async getPrice(priceId) {
        return this.request('get', `/prices/${priceId}`);
    }
    /**
     * Update a price
     * @param priceId Price ID
     * @param data Update data
     */
    async updatePrice(priceId, data) {
        return this.request('post', `/prices/${priceId}`, data);
    }
    /**
     * List prices
     * @param params Pagination parameters
     */
    async listPrices(params) {
        return this.request('get', '/prices', undefined, params);
    }
    // Subscriptions endpoints
    /**
     * Create a subscription
     * @param data Subscription data
     */
    async createSubscription(data) {
        return this.request('post', '/subscriptions', data);
    }
    /**
     * Retrieve a subscription
     * @param subscriptionId Subscription ID
     */
    async getSubscription(subscriptionId) {
        return this.request('get', `/subscriptions/${subscriptionId}`);
    }
    /**
     * Update a subscription
     * @param subscriptionId Subscription ID
     * @param data Update data
     */
    async updateSubscription(subscriptionId, data) {
        return this.request('post', `/subscriptions/${subscriptionId}`, data);
    }
    /**
     * Cancel a subscription
     * @param subscriptionId Subscription ID
     * @param data Cancellation data
     */
    async cancelSubscription(subscriptionId, data) {
        return this.request('delete', `/subscriptions/${subscriptionId}`, data);
    }
    /**
     * List subscriptions
     * @param params Pagination parameters
     */
    async listSubscriptions(params) {
        return this.request('get', '/subscriptions', undefined, params);
    }
    // Invoices endpoints
    /**
     * Create an invoice
     * @param data Invoice data
     */
    async createInvoice(data) {
        return this.request('post', '/invoices', data);
    }
    /**
     * Retrieve an invoice
     * @param invoiceId Invoice ID
     */
    async getInvoice(invoiceId) {
        return this.request('get', `/invoices/${invoiceId}`);
    }
    /**
     * Update an invoice
     * @param invoiceId Invoice ID
     * @param data Update data
     */
    async updateInvoice(invoiceId, data) {
        return this.request('post', `/invoices/${invoiceId}`, data);
    }
    /**
     * Delete an invoice
     * @param invoiceId Invoice ID
     */
    async deleteInvoice(invoiceId) {
        return this.request('delete', `/invoices/${invoiceId}`);
    }
    /**
     * Finalize an invoice
     * @param invoiceId Invoice ID
     * @param data Finalization data
     */
    async finalizeInvoice(invoiceId, data) {
        return this.request('post', `/invoices/${invoiceId}/finalize`, data);
    }
    /**
     * Pay an invoice
     * @param invoiceId Invoice ID
     * @param data Payment data
     */
    async payInvoice(invoiceId, data) {
        return this.request('post', `/invoices/${invoiceId}/pay`, data);
    }
    /**
     * List invoices
     * @param params Pagination parameters
     */
    async listInvoices(params) {
        return this.request('get', '/invoices', undefined, params);
    }
    // Refunds endpoints
    /**
     * Create a refund
     * @param data Refund data
     */
    async createRefund(data) {
        return this.request('post', '/refunds', data);
    }
    /**
     * Retrieve a refund
     * @param refundId Refund ID
     */
    async getRefund(refundId) {
        return this.request('get', `/refunds/${refundId}`);
    }
    /**
     * Update a refund
     * @param refundId Refund ID
     * @param data Update data
     */
    async updateRefund(refundId, data) {
        return this.request('post', `/refunds/${refundId}`, data);
    }
    /**
     * List refunds
     * @param params Pagination parameters
     */
    async listRefunds(params) {
        return this.request('get', '/refunds', undefined, params);
    }
    // Webhook endpoints
    /**
     * Create a webhook endpoint
     * @param data Webhook data
     */
    async createWebhook(data) {
        return this.request('post', '/webhook_endpoints', data);
    }
    /**
     * Retrieve a webhook endpoint
     * @param webhookId Webhook ID
     */
    async getWebhook(webhookId) {
        return this.request('get', `/webhook_endpoints/${webhookId}`);
    }
    /**
     * Update a webhook endpoint
     * @param webhookId Webhook ID
     * @param data Update data
     */
    async updateWebhook(webhookId, data) {
        return this.request('post', `/webhook_endpoints/${webhookId}`, data);
    }
    /**
     * Delete a webhook endpoint
     * @param webhookId Webhook ID
     */
    async deleteWebhook(webhookId) {
        return this.request('delete', `/webhook_endpoints/${webhookId}`);
    }
    /**
     * List webhook endpoints
     * @param params Pagination parameters
     */
    async listWebhooks(params) {
        return this.request('get', '/webhook_endpoints', undefined, params);
    }
}
exports.StripeAPI = StripeAPI;
