import PayPalAuthOptions from '../interfaces/PayPal/PayPalAuthOptions';
import PayPalPaginationParams from '../interfaces/PayPal/PayPalPaginationParams';
/**
 * Complete PayPal API wrapper for interacting with all PayPal endpoints
 */
export declare class PayPalAPI {
    private clientId;
    private clientSecret;
    private sandbox;
    private accessToken;
    private tokenExpiry;
    private baseUrl;
    /**
     * Create a new PayPal API client
     * @param options Authentication options
     */
    constructor(options: PayPalAuthOptions);
    /**
     * Get OAuth access token
     */
    private getAccessToken;
    /**
     * Make a request to the PayPal API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    private request;
    /**
     * Create an order
     * @param data Order data
     */
    createOrder(data: {
        intent: 'CAPTURE' | 'AUTHORIZE';
        purchase_units: Array<{
            amount: {
                currency_code: string;
                value: string;
                breakdown?: {
                    item_total?: {
                        currency_code: string;
                        value: string;
                    };
                    shipping?: {
                        currency_code: string;
                        value: string;
                    };
                    tax_total?: {
                        currency_code: string;
                        value: string;
                    };
                    discount?: {
                        currency_code: string;
                        value: string;
                    };
                };
            };
            reference_id?: string;
            description?: string;
            custom_id?: string;
            invoice_id?: string;
            items?: Array<{
                name: string;
                quantity: string;
                unit_amount: {
                    currency_code: string;
                    value: string;
                };
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
                name?: {
                    full_name?: string;
                };
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
    }): Promise<any>;
    /**
     * Get order details
     * @param orderId Order ID
     */
    getOrder(orderId: string): Promise<any>;
    /**
     * Update order
     * @param orderId Order ID
     * @param data Patch operations
     */
    updateOrder(orderId: string, data: Array<{
        op: 'add' | 'replace' | 'remove';
        path: string;
        value?: any;
    }>): Promise<any>;
    /**
     * Authorize payment for order
     * @param orderId Order ID
     * @param data Optional data
     */
    authorizeOrder(orderId: string, data?: Record<string, any>): Promise<any>;
    /**
     * Capture payment for order
     * @param orderId Order ID
     * @param data Optional data
     */
    captureOrder(orderId: string, data?: Record<string, any>): Promise<any>;
    /**
     * Show payment details
     * @param paymentId Payment ID
     */
    getPayment(paymentId: string): Promise<any>;
    /**
     * Refund captured payment
     * @param captureId Capture ID
     * @param data Refund data
     */
    refundPayment(captureId: string, data?: {
        amount?: {
            value: string;
            currency_code: string;
        };
        invoice_id?: string;
        note_to_payer?: string;
    }): Promise<any>;
    /**
     * Get refund details
     * @param refundId Refund ID
     */
    getRefund(refundId: string): Promise<any>;
    /**
     * Get authorized payment details
     * @param authorizationId Authorization ID
     */
    getAuthorization(authorizationId: string): Promise<any>;
    /**
     * Capture authorized payment
     * @param authorizationId Authorization ID
     * @param data Capture data
     */
    captureAuthorization(authorizationId: string, data?: {
        amount?: {
            value: string;
            currency_code: string;
        };
        invoice_id?: string;
        final_capture?: boolean;
        note_to_payer?: string;
    }): Promise<any>;
    /**
     * Void authorized payment
     * @param authorizationId Authorization ID
     */
    voidAuthorization(authorizationId: string): Promise<any>;
    /**
     * Generate invoice number
     */
    generateInvoiceNumber(): Promise<any>;
    /**
     * Create draft invoice
     * @param data Invoice data
     */
    createInvoice(data: {
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
    }): Promise<any>;
    /**
     * Get invoice details
     * @param invoiceId Invoice ID
     */
    getInvoice(invoiceId: string): Promise<any>;
    /**
     * Update invoice
     * @param invoiceId Invoice ID
     * @param data Invoice data (same as createInvoice)
     */
    updateInvoice(invoiceId: string, data: any): Promise<any>;
    /**
     * Delete invoice
     * @param invoiceId Invoice ID
     */
    deleteInvoice(invoiceId: string): Promise<any>;
    /**
     * Send invoice
     * @param invoiceId Invoice ID
     * @param data Additional data
     */
    sendInvoice(invoiceId: string, data?: {
        send_to_recipient?: boolean;
        send_to_invoicer?: boolean;
    }): Promise<any>;
    /**
     * Search invoices
     * @param data Search parameters
     */
    searchInvoices(data: {
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
    }): Promise<any>;
    /**
     * Create subscription plan
     * @param data Plan data
     */
    createPlan(data: {
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
    }): Promise<any>;
    /**
     * Get plan details
     * @param planId Plan ID
     */
    getPlan(planId: string): Promise<any>;
    /**
     * Update plan
     * @param planId Plan ID
     * @param data Patch operations
     */
    updatePlan(planId: string, data: Array<{
        op: 'replace';
        path: string;
        value: any;
    }>): Promise<any>;
    /**
     * List plans
     * @param params Query parameters
     */
    listPlans(params?: PayPalPaginationParams & {
        product_id?: string;
        plan_ids?: string;
    }): Promise<any>;
    /**
     * Create product
     * @param data Product data
     */
    createProduct(data: {
        name: string;
        description?: string;
        type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
        category?: string;
        image_url?: string;
        home_url?: string;
    }): Promise<any>;
    /**
     * Get product details
     * @param productId Product ID
     */
    getProduct(productId: string): Promise<any>;
    /**
     * List products
     * @param params Query parameters
     */
    listProducts(params?: PayPalPaginationParams): Promise<any>;
    /**
     * Create subscription
     * @param data Subscription data
     */
    createSubscription(data: {
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
    }): Promise<any>;
    /**
     * Get subscription details
     * @param subscriptionId Subscription ID
     */
    getSubscription(subscriptionId: string): Promise<any>;
    /**
     * Update subscription
     * @param subscriptionId Subscription ID
     * @param data Patch operations
     */
    updateSubscription(subscriptionId: string, data: Array<{
        op: 'replace' | 'add';
        path: string;
        value: any;
    }>): Promise<any>;
    /**
     * Suspend subscription
     * @param subscriptionId Subscription ID
     * @param reason Reason for suspension
     */
    suspendSubscription(subscriptionId: string, reason: string): Promise<any>;
    /**
     * Activate subscription
     * @param subscriptionId Subscription ID
     * @param reason Reason for activation
     */
    activateSubscription(subscriptionId: string, reason: string): Promise<any>;
    /**
     * Cancel subscription
     * @param subscriptionId Subscription ID
     * @param reason Reason for cancellation
     */
    cancelSubscription(subscriptionId: string, reason: string): Promise<any>;
    /**
     * List disputes
     * @param params Query parameters
     */
    listDisputes(params?: {
        start_time?: string;
        end_time?: string;
        disputed_transaction_id?: string;
        reason?: string;
        status?: string;
        page_size?: number;
        next_page_token?: string;
    }): Promise<any>;
    /**
     * Get dispute details
     * @param disputeId Dispute ID
     */
    getDispute(disputeId: string): Promise<any>;
    /**
     * Create payout
     * @param data Payout data
     */
    createPayout(data: {
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
    }): Promise<any>;
    /**
     * Get payout details
     * @param payoutBatchId Payout batch ID
     */
    getPayout(payoutBatchId: string): Promise<any>;
    /**
     * Get payout item details
     * @param payoutItemId Payout item ID
     */
    getPayoutItem(payoutItemId: string): Promise<any>;
    /**
     * Cancel unclaimed payout item
     * @param payoutItemId Payout item ID
     */
    cancelPayoutItem(payoutItemId: string): Promise<any>;
    /**
     * Create webhook
     * @param data Webhook data
     */
    createWebhook(data: {
        url: string;
        event_types: Array<{
            name: string;
        }>;
    }): Promise<any>;
    /**
     * Get webhook details
     * @param webhookId Webhook ID
     */
    getWebhook(webhookId: string): Promise<any>;
    /**
     * List webhooks
     */
    listWebhooks(): Promise<any>;
    /**
     * Update webhook
     * @param webhookId Webhook ID
     * @param data Patch operations
     */
    updateWebhook(webhookId: string, data: Array<{
        op: 'add' | 'replace' | 'remove';
        path: string;
        value?: any;
    }>): Promise<any>;
    /**
     * Delete webhook
     * @param webhookId Webhook ID
     */
    deleteWebhook(webhookId: string): Promise<any>;
    /**
     * List event types for webhooks
     */
    listEventTypes(): Promise<any>;
    /**
     * Verify webhook signature
     * @param data Verification data
     */
    verifyWebhookSignature(data: {
        auth_algo: string;
        cert_url: string;
        transmission_id: string;
        transmission_sig: string;
        transmission_time: string;
        webhook_id: string;
        webhook_event: Record<string, any>;
    }): Promise<any>;
}
