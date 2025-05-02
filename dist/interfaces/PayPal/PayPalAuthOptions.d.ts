/**
 * Authentication options for the PayPal API
 */
export default interface PayPalAuthOptions {
    /**
     * PayPal Client ID for authentication
     */
    clientId: string;
    /**
     * PayPal Client Secret for authentication
     */
    clientSecret: string;
    /**
     * Whether to use the sandbox environment
     * (default: false)
     */
    sandbox?: boolean;
}
