/**
 * Pagination parameters for GitHub API requests
 */
export interface GitHubPaginationParams {
  /**
   * Number of items per page
   */
  per_page?: number;
  
  /**
   * Page number to retrieve
   */
  page?: number;
}

