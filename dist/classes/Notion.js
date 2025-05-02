"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Complete Notion API wrapper for interacting with all Notion endpoints
 */
class NotionAPI {
    /**
     * Create a new Notion API client
     * @param options Authentication options
     */
    constructor(options) {
        this.baseUrl = 'https://api.notion.com';
        this.apiKey = options.apiKey;
        this.version = options.version || '2022-06-28';
    }
    /**
     * Make a request to the Notion API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    async request(method, endpoint, data, params) {
        const response = await (0, axios_1.default)({
            method,
            url: `${this.baseUrl}${endpoint}`,
            data,
            params,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Notion-Version': this.version,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    // Database endpoints
    /**
     * Query a database
     * @param databaseId Database ID
     * @param data Query parameters
     */
    async queryDatabase(databaseId, data) {
        return this.request('post', `/v1/databases/${databaseId}/query`, data || {});
    }
    /**
     * Get database details
     * @param databaseId Database ID
     */
    async getDatabase(databaseId) {
        return this.request('get', `/v1/databases/${databaseId}`);
    }
    /**
     * Create a database
     * @param data Database data
     */
    async createDatabase(data) {
        return this.request('post', '/v1/databases', data);
    }
    /**
     * Update database
     * @param databaseId Database ID
     * @param data Update data
     */
    async updateDatabase(databaseId, data) {
        return this.request('patch', `/v1/databases/${databaseId}`, data);
    }
    // Page endpoints
    /**
     * Create a page
     * @param data Page data
     */
    async createPage(data) {
        return this.request('post', '/v1/pages', data);
    }
    /**
     * Get page details
     * @param pageId Page ID
     */
    async getPage(pageId) {
        return this.request('get', `/v1/pages/${pageId}`);
    }
    /**
     * Update page properties
     * @param pageId Page ID
     * @param data Update data
     */
    async updatePage(pageId, data) {
        return this.request('patch', `/v1/pages/${pageId}`, data);
    }
    /**
     * Get page property
     * @param pageId Page ID
     * @param propertyId Property ID
     */
    async getPageProperty(pageId, propertyId) {
        return this.request('get', `/v1/pages/${pageId}/properties/${propertyId}`);
    }
    // Block endpoints
    /**
     * Get block children
     * @param blockId Block ID
     * @param params Pagination parameters
     */
    async getBlockChildren(blockId, params) {
        return this.request('get', `/v1/blocks/${blockId}/children`, undefined, params);
    }
    /**
     * Append block children
     * @param blockId Block ID
     * @param data Block children data
     */
    async appendBlockChildren(blockId, data) {
        return this.request('patch', `/v1/blocks/${blockId}/children`, data);
    }
    /**
     * Get block details
     * @param blockId Block ID
     */
    async getBlock(blockId) {
        return this.request('get', `/v1/blocks/${blockId}`);
    }
    /**
     * Update block
     * @param blockId Block ID
     * @param data Update data
     */
    async updateBlock(blockId, data) {
        return this.request('patch', `/v1/blocks/${blockId}`, data);
    }
    /**
     * Delete block
     * @param blockId Block ID
     */
    async deleteBlock(blockId) {
        return this.request('delete', `/v1/blocks/${blockId}`);
    }
    // User endpoints
    /**
     * Get current user
     */
    async getCurrentUser() {
        return this.request('get', '/v1/users/me');
    }
    /**
     * Get user details
     * @param userId User ID
     */
    async getUser(userId) {
        return this.request('get', `/v1/users/${userId}`);
    }
    /**
     * List users
     * @param params Pagination parameters
     */
    async listUsers(params) {
        return this.request('get', '/v1/users', undefined, params);
    }
    // Search endpoint
    /**
     * Search Notion
     * @param data Search parameters
     */
    async search(data) {
        return this.request('post', '/v1/search', data || {});
    }
    // Comment endpoints
    /**
     * Create a comment
     * @param data Comment data
     */
    async createComment(data) {
        return this.request('post', '/v1/comments', data);
    }
    /**
     * List comments
     * @param params Query parameters
     */
    async listComments(params) {
        return this.request('get', '/v1/comments', undefined, params);
    }
    // Block content helpers
    /**
     * Create a heading block
     * @param level Heading level (1, 2, or 3)
     * @param text Heading text
     */
    createHeading(level, text) {
        const type = `heading_${level}`;
        return {
            type,
            [type]: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }]
            }
        };
    }
    /**
     * Create a paragraph block
     * @param text Paragraph text
     */
    createParagraph(text) {
        return {
            type: 'paragraph',
            paragraph: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }]
            }
        };
    }
    /**
     * Create a bulleted list item block
     * @param text List item text
     */
    createBulletedListItem(text) {
        return {
            type: 'bulleted_list_item',
            bulleted_list_item: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }]
            }
        };
    }
    /**
     * Create a numbered list item block
     * @param text List item text
     */
    createNumberedListItem(text) {
        return {
            type: 'numbered_list_item',
            numbered_list_item: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }]
            }
        };
    }
    /**
     * Create a to-do block
     * @param text Todo text
     * @param checked Checked state
     */
    createTodo(text, checked = false) {
        return {
            type: 'to_do',
            to_do: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }],
                checked
            }
        };
    }
    /**
     * Create a toggle block
     * @param text Toggle text
     */
    createToggle(text) {
        return {
            type: 'toggle',
            toggle: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }],
                children: []
            }
        };
    }
    /**
     * Create a code block
     * @param code Code content
     * @param language Programming language
     */
    createCode(code, language) {
        return {
            type: 'code',
            code: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: code
                        }
                    }],
                language
            }
        };
    }
    /**
     * Create a quote block
     * @param text Quote text
     */
    createQuote(text) {
        return {
            type: 'quote',
            quote: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }]
            }
        };
    }
    /**
     * Create a divider block
     */
    createDivider() {
        return {
            type: 'divider',
            divider: {}
        };
    }
    /**
     * Create a callout block
     * @param text Callout text
     * @param emoji Emoji icon
     */
    createCallout(text, emoji) {
        return {
            type: 'callout',
            callout: {
                rich_text: [{
                        type: 'text',
                        text: {
                            content: text
                        }
                    }],
                icon: {
                    type: 'emoji',
                    emoji
                }
            }
        };
    }
    /**
     * Create a bookmark block
     * @param url Bookmark URL
     * @param caption Optional caption
     */
    createBookmark(url, caption) {
        const bookmark = {
            type: 'bookmark',
            bookmark: {
                url
            }
        };
        if (caption) {
            bookmark.bookmark.caption = [{
                    type: 'text',
                    text: {
                        content: caption
                    }
                }];
        }
        return bookmark;
    }
    /**
     * Create an image block
     * @param url Image URL
     * @param caption Optional caption
     */
    createImage(url, caption) {
        const image = {
            type: 'image',
            image: {
                type: 'external',
                external: {
                    url
                }
            }
        };
        if (caption) {
            image.image.caption = [{
                    type: 'text',
                    text: {
                        content: caption
                    }
                }];
        }
        return image;
    }
    /**
     * Create a table block
     * @param rows Number of rows
     * @param columns Number of columns
     * @param hasColumnHeader Whether to include a column header
     * @param hasRowHeader Whether to include a row header
     */
    createTable(rows, columns, hasColumnHeader = false, hasRowHeader = false) {
        return {
            type: 'table',
            table: {
                table_width: columns,
                has_column_header: hasColumnHeader,
                has_row_header: hasRowHeader,
                children: []
            }
        };
    }
    /**
     * Create a table row block
     * @param cells Cell contents
     */
    createTableRow(cells) {
        return {
            type: 'table_row',
            table_row: {
                cells: cells.map(cell => [{
                        type: 'text',
                        text: {
                            content: cell
                        }
                    }])
            }
        };
    }
    /**
     * Create a database property
     * @param type Property type
     * @param options Property options
     */
    createDatabaseProperty(type, options) {
        const property = {};
        property[type] = options || {};
        return property;
    }
}
exports.NotionAPI = NotionAPI;
