import StripeAuthOptions from '../interfaces/Stripe/StripeAuthOptions';
import StripePaginationParams from '../interfaces/Stripe/StripePaginationParams';
/**
 * Complete Stripe API wrapper for interacting with all Stripe endpoints
 */
export declare class StripeAPI {
    private secretKey;
    private baseUrl;
    /**
     * Create a new Stripe API client
     * @param options Authentication options
     */
    constructor(options: StripeAuthOptions);
    /**
     * Make a request to the Stripe API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    private request;
    /**
     * Get current account balance
     */
    getBalance(): Promise<any>;
    /**
     * Get balance transaction by ID
     * @param transactionId Transaction ID
     */
    getBalanceTransaction(transactionId: string): Promise<any>;
    /**
     * List balance transactions
     * @param params Pagination parameters
     */
    listBalanceTransactions(params?: StripePaginationParams & {
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
        currency?: string;
        source?: string;
        type?: string;
    }): Promise<any>;
    /**
     * Create a charge
     * @param data Charge data
     */
    createCharge(data: {
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
    }): Promise<any>;
    /**
     * Retrieve a charge
     * @param chargeId Charge ID
     */
    getCharge(chargeId: string): Promise<any>;
    /**
     * Update a charge
     * @param chargeId Charge ID
     * @param data Update data
     */
    updateCharge(chargeId: string, data: {
        description?: string;
        metadata?: Record<string, string>;
        receipt_email?: string;
        fraud_details?: Record<string, string>;
        shipping?: Record<string, any>;
        transfer_group?: string;
    }): Promise<any>;
    /**
     * Capture a charge
     * @param chargeId Charge ID
     * @param data Capture data
     */
    captureCharge(chargeId: string, data?: {
        amount?: number;
        receipt_email?: string;
        statement_descriptor?: string;
        application_fee_amount?: number;
    }): Promise<any>;
    /**
     * List charges
     * @param params Pagination parameters
     */
    listCharges(params?: StripePaginationParams & {
        customer?: string;
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
        payment_intent?: string;
    }): Promise<any>;
    /**
     * Create a customer
     * @param data Customer data
     */
    createCustomer(data?: {
        address?: Record<string, string>;
        description?: string;
        email?: string;
        metadata?: Record<string, string>;
        name?: string;
        payment_method?: string;
        phone?: string;
        shipping?: Record<string, any>;
        source?: string;
    }): Promise<any>;
    /**
     * Retrieve a customer
     * @param customerId Customer ID
     */
    getCustomer(customerId: string): Promise<any>;
    /**
     * Update a customer
     * @param customerId Customer ID
     * @param data Update data
     */
    updateCustomer(customerId: string, data: {
        address?: Record<string, string>;
        description?: string;
        email?: string;
        metadata?: Record<string, string>;
        name?: string;
        phone?: string;
        shipping?: Record<string, any>;
        source?: string;
        default_source?: string;
        invoice_settings?: Record<string, any>;
    }): Promise<any>;
    /**
     * Delete a customer
     * @param customerId Customer ID
     */
    deleteCustomer(customerId: string): Promise<any>;
    /**
     * List customers
     * @param params Pagination parameters
     */
    listCustomers(params?: StripePaginationParams & {
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
        email?: string;
    }): Promise<any>;
    /**
     * Create a payment method
     * @param data Payment method data
     */
    createPaymentMethod(data: {
        type: string;
        card?: Record<string, any>;
        billing_details?: Record<string, any>;
        metadata?: Record<string, string>;
    }): Promise<any>;
    /**
     * Retrieve a payment method
     * @param paymentMethodId Payment method ID
     */
    getPaymentMethod(paymentMethodId: string): Promise<any>;
    /**
     * Update a payment method
     * @param paymentMethodId Payment method ID
     * @param data Update data
     */
    updatePaymentMethod(paymentMethodId: string, data: {
        billing_details?: Record<string, any>;
        metadata?: Record<string, string>;
    }): Promise<any>;
    /**
     * List payment methods
     * @param params Query parameters
     */
    listPaymentMethods(params: {
        customer: string;
        type: string;
        limit?: number;
    }): Promise<any>;
    /**
     * Attach a payment method to a customer
     * @param paymentMethodId Payment method ID
     * @param data Attachment data
     */
    attachPaymentMethod(paymentMethodId: string, data: {
        customer: string;
    }): Promise<any>;
    /**
     * Detach a payment method from a customer
     * @param paymentMethodId Payment method ID
     */
    detachPaymentMethod(paymentMethodId: string): Promise<any>;
    /**
     * Create a payment intent
     * @param data Payment intent data
     */
    createPaymentIntent(data: {
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
    }): Promise<any>;
    /**
     * Retrieve a payment intent
     * @param paymentIntentId Payment intent ID
     */
    getPaymentIntent(paymentIntentId: string): Promise<any>;
    /**
     * Update a payment intent
     * @param paymentIntentId Payment intent ID
     * @param data Update data
     */
    updatePaymentIntent(paymentIntentId: string, data: {
        amount?: number;
        currency?: string;
        description?: string;
        metadata?: Record<string, string>;
        payment_method_types?: string[];
        receipt_email?: string;
        shipping?: Record<string, any>;
        transfer_group?: string;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Confirm a payment intent
     * @param paymentIntentId Payment intent ID
     * @param data Confirmation data
     */
    confirmPaymentIntent(paymentIntentId: string, data?: {
        payment_method?: string;
        return_url?: string;
        receipt_email?: string;
        shipping?: Record<string, any>;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Cancel a payment intent
     * @param paymentIntentId Payment intent ID
     * @param data Cancellation data
     */
    cancelPaymentIntent(paymentIntentId: string, data?: {
        cancellation_reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'abandoned';
    }): Promise<any>;
    /**
     * List payment intents
     * @param params Pagination parameters
     */
    listPaymentIntents(params?: StripePaginationParams & {
        customer?: string;
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
    }): Promise<any>;
    /**
     * Create a product
     * @param data Product data
     */
    createProduct(data: {
        name: string;
        description?: string;
        active?: boolean;
        metadata?: Record<string, string>;
        images?: string[];
        [key: string]: any;
    }): Promise<any>;
    /**
     * Retrieve a product
     * @param productId Product ID
     */
    getProduct(productId: string): Promise<any>;
    /**
     * Update a product
     * @param productId Product ID
     * @param data Update data
     */
    updateProduct(productId: string, data: {
        name?: string;
        description?: string;
        active?: boolean;
        metadata?: Record<string, string>;
        images?: string[];
        [key: string]: any;
    }): Promise<any>;
    /**
     * Delete a product
     * @param productId Product ID
     */
    deleteProduct(productId: string): Promise<any>;
    /**
     * List products
     * @param params Pagination parameters
     */
    listProducts(params?: StripePaginationParams & {
        active?: boolean;
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
        ids?: string[];
        url?: string;
    }): Promise<any>;
    /**
     * Create a price
     * @param data Price data
     */
    createPrice(data: {
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
    }): Promise<any>;
    /**
     * Retrieve a price
     * @param priceId Price ID
     */
    getPrice(priceId: string): Promise<any>;
    /**
     * Update a price
     * @param priceId Price ID
     * @param data Update data
     */
    updatePrice(priceId: string, data: {
        nickname?: string;
        metadata?: Record<string, string>;
        active?: boolean;
    }): Promise<any>;
    /**
     * List prices
     * @param params Pagination parameters
     */
    listPrices(params?: StripePaginationParams & {
        active?: boolean;
        currency?: string;
        product?: string;
        type?: 'one_time' | 'recurring';
    }): Promise<any>;
    /**
     * Create a subscription
     * @param data Subscription data
     */
    createSubscription(data: {
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
    }): Promise<any>;
    /**
     * Retrieve a subscription
     * @param subscriptionId Subscription ID
     */
    getSubscription(subscriptionId: string): Promise<any>;
    /**
     * Update a subscription
     * @param subscriptionId Subscription ID
     * @param data Update data
     */
    updateSubscription(subscriptionId: string, data: {
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
    }): Promise<any>;
    /**
     * Cancel a subscription
     * @param subscriptionId Subscription ID
     * @param data Cancellation data
     */
    cancelSubscription(subscriptionId: string, data?: {
        cancel_at_period_end?: boolean;
        prorate?: boolean;
        invoice_now?: boolean;
    }): Promise<any>;
    /**
     * List subscriptions
     * @param params Pagination parameters
     */
    listSubscriptions(params?: StripePaginationParams & {
        customer?: string;
        price?: string;
        status?: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'all';
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
    }): Promise<any>;
    /**
     * Create an invoice
     * @param data Invoice data
     */
    createInvoice(data: {
        customer: string;
        auto_advance?: boolean;
        collection_method?: 'charge_automatically' | 'send_invoice';
        description?: string;
        metadata?: Record<string, string>;
        subscription?: string;
        days_until_due?: number;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Retrieve an invoice
     * @param invoiceId Invoice ID
     */
    getInvoice(invoiceId: string): Promise<any>;
    /**
     * Update an invoice
     * @param invoiceId Invoice ID
     * @param data Update data
     */
    updateInvoice(invoiceId: string, data: {
        auto_advance?: boolean;
        collection_method?: 'charge_automatically' | 'send_invoice';
        description?: string;
        metadata?: Record<string, string>;
        days_until_due?: number;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Delete an invoice
     * @param invoiceId Invoice ID
     */
    deleteInvoice(invoiceId: string): Promise<any>;
    /**
     * Finalize an invoice
     * @param invoiceId Invoice ID
     * @param data Finalization data
     */
    finalizeInvoice(invoiceId: string, data?: {
        auto_advance?: boolean;
    }): Promise<any>;
    /**
     * Pay an invoice
     * @param invoiceId Invoice ID
     * @param data Payment data
     */
    payInvoice(invoiceId: string, data?: {
        source?: string;
        payment_method?: string;
        paid_out_of_band?: boolean;
    }): Promise<any>;
    /**
     * List invoices
     * @param params Pagination parameters
     */
    listInvoices(params?: StripePaginationParams & {
        customer?: string;
        subscription?: string;
        status?: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
    }): Promise<any>;
    /**
     * Create a refund
     * @param data Refund data
     */
    createRefund(data: {
        charge?: string;
        payment_intent?: string;
        amount?: number;
        reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
        metadata?: Record<string, string>;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Retrieve a refund
     * @param refundId Refund ID
     */
    getRefund(refundId: string): Promise<any>;
    /**
     * Update a refund
     * @param refundId Refund ID
     * @param data Update data
     */
    updateRefund(refundId: string, data: {
        metadata?: Record<string, string>;
    }): Promise<any>;
    /**
     * List refunds
     * @param params Pagination parameters
     */
    listRefunds(params?: StripePaginationParams & {
        charge?: string;
        payment_intent?: string;
        created?: number | {
            gt?: number;
            gte?: number;
            lt?: number;
            lte?: number;
        };
    }): Promise<any>;
    /**
     * Create a webhook endpoint
     * @param data Webhook data
     */
    createWebhook(data: {
        url: string;
        enabled_events: string[];
        description?: string;
        metadata?: Record<string, string>;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Retrieve a webhook endpoint
     * @param webhookId Webhook ID
     */
    getWebhook(webhookId: string): Promise<any>;
    /**
     * Update a webhook endpoint
     * @param webhookId Webhook ID
     * @param data Update data
     */
    updateWebhook(webhookId: string, data: {
        url?: string;
        enabled_events?: string[];
        description?: string;
        metadata?: Record<string, string>;
        [key: string]: any;
    }): Promise<any>;
    /**
     * Delete a webhook endpoint
     * @param webhookId Webhook ID
     */
    deleteWebhook(webhookId: string): Promise<any>;
    /**
     * List webhook endpoints
     * @param params Pagination parameters
     */
    listWebhooks(params?: StripePaginationParams): Promise<any>;
}
