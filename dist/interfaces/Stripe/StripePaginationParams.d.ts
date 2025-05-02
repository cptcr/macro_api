/**
 * Pagination parameters for Stripe API requests
 */
export default interface StripePaginationParams {
    /**
     * Maximum number of objects to return
     */
    limit?: number;
    /**
     * Starting point for the list
     */
    starting_after?: string;
    /**
     * Ending point for the list
     */
    ending_before?: string;
}
