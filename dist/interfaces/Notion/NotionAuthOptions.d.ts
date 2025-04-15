/**
 * Authentication options for the Notion API
 */
export default interface NotionAuthOptions {
    /**
     * Notion API Key for authentication
     */
    apiKey: string;
    /**
     * Notion API version
     * (default: "2022-06-28")
     */
    version?: string;
}
