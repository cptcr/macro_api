import axios from 'axios';
import NotionAuthOptions from '../interfaces/Notion/NotionAuthOptions';
import NotionPaginationParams from '../interfaces/Notion/NotionPaginationParams';

/**
 * Complete Notion API wrapper for interacting with all Notion endpoints
 */
export class NotionAPI {
  private apiKey: string;
  private version: string;
  private baseUrl: string = 'https://api.notion.com';
  
  /**
   * Create a new Notion API client
   * @param options Authentication options
   */
  constructor(options: NotionAuthOptions) {
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
  private async request<T>(
    method: 'get' | 'post' | 'patch' | 'delete',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const response = await axios({
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
  async queryDatabase(databaseId: string, data?: {
    filter?: Record<string, any>;
    sorts?: Array<{
      property?: string;
      timestamp?: 'created_time' | 'last_edited_time';
      direction: 'ascending' | 'descending';
    }>;
    start_cursor?: string;
    page_size?: number;
  }) {
    return this.request<any>('post', `/v1/databases/${databaseId}/query`, data || {});
  }

  /**
   * Get database details
   * @param databaseId Database ID
   */
  async getDatabase(databaseId: string) {
    return this.request<any>('get', `/v1/databases/${databaseId}`);
  }

  /**
   * Create a database
   * @param data Database data
   */
  async createDatabase(data: {
    parent: {
      type: 'page_id';
      page_id: string;
    };
    title: Array<{
      type: 'text';
      text: {
        content: string;
        link?: { url: string };
      };
      annotations?: Record<string, any>;
    }>;
    properties: Record<string, {
      title?: {};
      rich_text?: {};
      number?: {
        format?: 'number' | 'number_with_commas' | 'percent' | 'dollar' | 'euro' | 'pound' | 'yen' | 'ruble' | 'rupee' | 'won' | 'yuan';
      };
      select?: {
        options: Array<{
          name: string;
          color?: string;
        }>;
      };
      multi_select?: {
        options: Array<{
          name: string;
          color?: string;
        }>;
      };
      date?: {};
      people?: {};
      files?: {};
      checkbox?: {};
      url?: {};
      email?: {};
      phone_number?: {};
      formula?: {
        expression: string;
      };
      relation?: {
        database_id: string;
        synced_property_name?: string;
      };
      rollup?: {
        relation_property_name: string;
        relation_property_id: string;
        rollup_property_name: string;
        rollup_property_id: string;
        function: 'count' | 'count_values' | 'empty' | 'not_empty' | 'unique' | 'show_original' | 'show_unique' | 'sum' | 'average' | 'median' | 'min' | 'max' | 'range' | 'earliest_date' | 'latest_date' | 'date_range' | 'checked' | 'unchecked' | 'percent_checked' | 'percent_unchecked';
      };
      created_time?: {};
      created_by?: {};
      last_edited_time?: {};
      last_edited_by?: {};
    }>;
    icon?: {
      type: 'emoji' | 'external';
      emoji?: string;
      external?: { url: string };
    };
    cover?: {
      type: 'external';
      external: { url: string };
    };
    is_inline?: boolean;
  }) {
    return this.request<any>('post', '/v1/databases', data);
  }

  /**
   * Update database
   * @param databaseId Database ID
   * @param data Update data
   */
  async updateDatabase(databaseId: string, data: {
    title?: Array<{
      type: 'text';
      text: {
        content: string;
        link?: { url: string };
      };
      annotations?: Record<string, any>;
    }>;
    properties?: Record<string, any>;
    icon?: {
      type: 'emoji' | 'external';
      emoji?: string;
      external?: { url: string };
    } | null;
    cover?: {
      type: 'external';
      external: { url: string };
    } | null;
    is_inline?: boolean;
  }) {
    return this.request<any>('patch', `/v1/databases/${databaseId}`, data);
  }

  // Page endpoints

  /**
   * Create a page
   * @param data Page data
   */
  async createPage(data: {
    parent: {
      type: 'database_id' | 'page_id';
      database_id?: string;
      page_id?: string;
    };
    properties: Record<string, any>;
    children?: Array<Record<string, any>>;
    icon?: {
      type: 'emoji' | 'external';
      emoji?: string;
      external?: { url: string };
    };
    cover?: {
      type: 'external';
      external: { url: string };
    };
  }) {
    return this.request<any>('post', '/v1/pages', data);
  }

  /**
   * Get page details
   * @param pageId Page ID
   */
  async getPage(pageId: string) {
    return this.request<any>('get', `/v1/pages/${pageId}`);
  }

  /**
   * Update page properties
   * @param pageId Page ID
   * @param data Update data
   */
  async updatePage(pageId: string, data: {
    properties?: Record<string, any>;
    icon?: {
      type: 'emoji' | 'external';
      emoji?: string;
      external?: { url: string };
    } | null;
    cover?: {
      type: 'external';
      external: { url: string };
    } | null;
    archived?: boolean;
  }) {
    return this.request<any>('patch', `/v1/pages/${pageId}`, data);
  }

  /**
   * Get page property
   * @param pageId Page ID
   * @param propertyId Property ID
   */
  async getPageProperty(pageId: string, propertyId: string) {
    return this.request<any>('get', `/v1/pages/${pageId}/properties/${propertyId}`);
  }

  // Block endpoints

  /**
   * Get block children
   * @param blockId Block ID
   * @param params Pagination parameters
   */
  async getBlockChildren(blockId: string, params?: NotionPaginationParams) {
    return this.request<any>('get', `/v1/blocks/${blockId}/children`, undefined, params);
  }

  /**
   * Append block children
   * @param blockId Block ID
   * @param data Block children data
   */
  async appendBlockChildren(blockId: string, data: {
    children: Array<Record<string, any>>;
  }) {
    return this.request<any>('patch', `/v1/blocks/${blockId}/children`, data);
  }

  /**
   * Get block details
   * @param blockId Block ID
   */
  async getBlock(blockId: string) {
    return this.request<any>('get', `/v1/blocks/${blockId}`);
  }

  /**
   * Update block
   * @param blockId Block ID
   * @param data Update data
   */
  async updateBlock(blockId: string, data: Record<string, any>) {
    return this.request<any>('patch', `/v1/blocks/${blockId}`, data);
  }

  /**
   * Delete block
   * @param blockId Block ID
   */
  async deleteBlock(blockId: string) {
    return this.request<any>('delete', `/v1/blocks/${blockId}`);
  }

  // User endpoints

  /**
   * Get current user
   */
  async getCurrentUser() {
    return this.request<any>('get', '/v1/users/me');
  }

  /**
   * Get user details
   * @param userId User ID
   */
  async getUser(userId: string) {
    return this.request<any>('get', `/v1/users/${userId}`);
  }

  /**
   * List users
   * @param params Pagination parameters
   */
  async listUsers(params?: NotionPaginationParams) {
    return this.request<any>('get', '/v1/users', undefined, params);
  }

  // Search endpoint

  /**
   * Search Notion
   * @param data Search parameters
   */
  async search(data?: {
    query?: string;
    filter?: {
      value: 'page' | 'database';
      property: 'object';
    };
    sort?: {
      direction: 'ascending' | 'descending';
      timestamp: 'last_edited_time';
    };
    start_cursor?: string;
    page_size?: number;
  }) {
    return this.request<any>('post', '/v1/search', data || {});
  }

  // Comment endpoints

  /**
   * Create a comment
   * @param data Comment data
   */
  async createComment(data: {
    parent: {
      page_id: string;
    } | {
      block_id: string;
    } | {
      discussion_id: string;
    };
    rich_text: Array<{
      type: 'text';
      text: {
        content: string;
        link?: { url: string };
      };
      annotations?: {
        bold?: boolean;
        italic?: boolean;
        strikethrough?: boolean;
        underline?: boolean;
        code?: boolean;
        color?: string;
      };
    }>;
  }) {
    return this.request<any>('post', '/v1/comments', data);
  }

  /**
   * List comments
   * @param params Query parameters
   */
  async listComments(params: {
    block_id?: string;
    page_id?: string;
    start_cursor?: string;
    page_size?: number;
  }) {
    return this.request<any>('get', '/v1/comments', undefined, params);
  }

  // Block content helpers

  /**
   * Create a heading block
   * @param level Heading level (1, 2, or 3)
   * @param text Heading text
   */
  createHeading(level: 1 | 2 | 3, text: string) {
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
  createParagraph(text: string) {
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
  createBulletedListItem(text: string) {
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
  createNumberedListItem(text: string) {
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
  createTodo(text: string, checked = false) {
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
  createToggle(text: string) {
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
  createCode(code: string, language: 'abap' | 'arduino' | 'bash' | 'basic' | 'c' | 'clojure' | 'coffeescript' | 'c++' | 'c#' | 'css' | 'dart' | 'diff' | 'docker' | 'elixir' | 'elm' | 'erlang' | 'flow' | 'fortran' | 'f#' | 'gherkin' | 'glsl' | 'go' | 'graphql' | 'groovy' | 'haskell' | 'html' | 'java' | 'javascript' | 'json' | 'julia' | 'kotlin' | 'latex' | 'less' | 'lisp' | 'livescript' | 'lua' | 'makefile' | 'markdown' | 'markup' | 'matlab' | 'mermaid' | 'nix' | 'objective-c' | 'ocaml' | 'pascal' | 'perl' | 'php' | 'plain text' | 'powershell' | 'prolog' | 'protobuf' | 'python' | 'r' | 'reason' | 'ruby' | 'rust' | 'sass' | 'scala' | 'scheme' | 'scss' | 'shell' | 'sql' | 'swift' | 'typescript' | 'vb.net' | 'verilog' | 'vhdl' | 'visual basic' | 'webassembly' | 'xml' | 'yaml' | 'java/c/c++/c#') {
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
  createQuote(text: string) {
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
  createCallout(text: string, emoji: string) {
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
  createBookmark(url: string, caption?: string) {
    const bookmark: any = {
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
  createImage(url: string, caption?: string) {
    const image: any = {
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
  createTable(rows: number, columns: number, hasColumnHeader = false, hasRowHeader = false) {
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
  createTableRow(cells: string[]) {
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
  createDatabaseProperty(type: string, options?: Record<string, any>) {
    const property: Record<string, any> = {};
    property[type] = options || {};
    return property;
  }
}