/**
 * Pagination parameters for Notion API requests
 */
export default interface NotionPaginationParams {
    /**
     * Number of items to return per page
     * Maximum: 100
     */
    page_size?: number;
    
    /**
     * Cursor to start from
     */
    start_cursor?: string;
  }