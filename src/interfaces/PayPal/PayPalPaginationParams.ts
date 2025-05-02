/**
 * Pagination parameters for PayPal API requests
 */
export default interface PayPalPaginationParams {
    /**
     * Number of items to return per page
     */
    page_size?: number;
    
    /**
     * Start index for the list
     */
    page?: number;
    
    /**
     * Token for the next page
     */
    next_page_token?: string;
    
    /**
     * Sort order (asc or desc)
     */
    sort_order?: 'asc' | 'desc';
    
    /**
     * Field to sort by
     */
    sort_by?: string;
    
    /**
     * Total count indicator
     */
    total_required?: boolean;
  }