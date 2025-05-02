import NotionAuthOptions from '../interfaces/Notion/NotionAuthOptions';
import NotionPaginationParams from '../interfaces/Notion/NotionPaginationParams';
/**
 * Complete Notion API wrapper for interacting with all Notion endpoints
 */
export declare class NotionAPI {
    private apiKey;
    private version;
    private baseUrl;
    /**
     * Create a new Notion API client
     * @param options Authentication options
     */
    constructor(options: NotionAuthOptions);
    /**
     * Make a request to the Notion API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    private request;
    /**
     * Query a database
     * @param databaseId Database ID
     * @param data Query parameters
     */
    queryDatabase(databaseId: string, data?: {
        filter?: Record<string, any>;
        sorts?: Array<{
            property?: string;
            timestamp?: 'created_time' | 'last_edited_time';
            direction: 'ascending' | 'descending';
        }>;
        start_cursor?: string;
        page_size?: number;
    }): Promise<any>;
    /**
     * Get database details
     * @param databaseId Database ID
     */
    getDatabase(databaseId: string): Promise<any>;
    /**
     * Create a database
     * @param data Database data
     */
    createDatabase(data: {
        parent: {
            type: 'page_id';
            page_id: string;
        };
        title: Array<{
            type: 'text';
            text: {
                content: string;
                link?: {
                    url: string;
                };
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
            external?: {
                url: string;
            };
        };
        cover?: {
            type: 'external';
            external: {
                url: string;
            };
        };
        is_inline?: boolean;
    }): Promise<any>;
    /**
     * Update database
     * @param databaseId Database ID
     * @param data Update data
     */
    updateDatabase(databaseId: string, data: {
        title?: Array<{
            type: 'text';
            text: {
                content: string;
                link?: {
                    url: string;
                };
            };
            annotations?: Record<string, any>;
        }>;
        properties?: Record<string, any>;
        icon?: {
            type: 'emoji' | 'external';
            emoji?: string;
            external?: {
                url: string;
            };
        } | null;
        cover?: {
            type: 'external';
            external: {
                url: string;
            };
        } | null;
        is_inline?: boolean;
    }): Promise<any>;
    /**
     * Create a page
     * @param data Page data
     */
    createPage(data: {
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
            external?: {
                url: string;
            };
        };
        cover?: {
            type: 'external';
            external: {
                url: string;
            };
        };
    }): Promise<any>;
    /**
     * Get page details
     * @param pageId Page ID
     */
    getPage(pageId: string): Promise<any>;
    /**
     * Update page properties
     * @param pageId Page ID
     * @param data Update data
     */
    updatePage(pageId: string, data: {
        properties?: Record<string, any>;
        icon?: {
            type: 'emoji' | 'external';
            emoji?: string;
            external?: {
                url: string;
            };
        } | null;
        cover?: {
            type: 'external';
            external: {
                url: string;
            };
        } | null;
        archived?: boolean;
    }): Promise<any>;
    /**
     * Get page property
     * @param pageId Page ID
     * @param propertyId Property ID
     */
    getPageProperty(pageId: string, propertyId: string): Promise<any>;
    /**
     * Get block children
     * @param blockId Block ID
     * @param params Pagination parameters
     */
    getBlockChildren(blockId: string, params?: NotionPaginationParams): Promise<any>;
    /**
     * Append block children
     * @param blockId Block ID
     * @param data Block children data
     */
    appendBlockChildren(blockId: string, data: {
        children: Array<Record<string, any>>;
    }): Promise<any>;
    /**
     * Get block details
     * @param blockId Block ID
     */
    getBlock(blockId: string): Promise<any>;
    /**
     * Update block
     * @param blockId Block ID
     * @param data Update data
     */
    updateBlock(blockId: string, data: Record<string, any>): Promise<any>;
    /**
     * Delete block
     * @param blockId Block ID
     */
    deleteBlock(blockId: string): Promise<any>;
    /**
     * Get current user
     */
    getCurrentUser(): Promise<any>;
    /**
     * Get user details
     * @param userId User ID
     */
    getUser(userId: string): Promise<any>;
    /**
     * List users
     * @param params Pagination parameters
     */
    listUsers(params?: NotionPaginationParams): Promise<any>;
    /**
     * Search Notion
     * @param data Search parameters
     */
    search(data?: {
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
    }): Promise<any>;
    /**
     * Create a comment
     * @param data Comment data
     */
    createComment(data: {
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
                link?: {
                    url: string;
                };
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
    }): Promise<any>;
    /**
     * List comments
     * @param params Query parameters
     */
    listComments(params: {
        block_id?: string;
        page_id?: string;
        start_cursor?: string;
        page_size?: number;
    }): Promise<any>;
    /**
     * Create a heading block
     * @param level Heading level (1, 2, or 3)
     * @param text Heading text
     */
    createHeading(level: 1 | 2 | 3, text: string): {
        [x: string]: string | {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
        };
        type: string;
    };
    /**
     * Create a paragraph block
     * @param text Paragraph text
     */
    createParagraph(text: string): {
        type: string;
        paragraph: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
        };
    };
    /**
     * Create a bulleted list item block
     * @param text List item text
     */
    createBulletedListItem(text: string): {
        type: string;
        bulleted_list_item: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
        };
    };
    /**
     * Create a numbered list item block
     * @param text List item text
     */
    createNumberedListItem(text: string): {
        type: string;
        numbered_list_item: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
        };
    };
    /**
     * Create a to-do block
     * @param text Todo text
     * @param checked Checked state
     */
    createTodo(text: string, checked?: boolean): {
        type: string;
        to_do: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
            checked: boolean;
        };
    };
    /**
     * Create a toggle block
     * @param text Toggle text
     */
    createToggle(text: string): {
        type: string;
        toggle: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
            children: never[];
        };
    };
    /**
     * Create a code block
     * @param code Code content
     * @param language Programming language
     */
    createCode(code: string, language: 'abap' | 'arduino' | 'bash' | 'basic' | 'c' | 'clojure' | 'coffeescript' | 'c++' | 'c#' | 'css' | 'dart' | 'diff' | 'docker' | 'elixir' | 'elm' | 'erlang' | 'flow' | 'fortran' | 'f#' | 'gherkin' | 'glsl' | 'go' | 'graphql' | 'groovy' | 'haskell' | 'html' | 'java' | 'javascript' | 'json' | 'julia' | 'kotlin' | 'latex' | 'less' | 'lisp' | 'livescript' | 'lua' | 'makefile' | 'markdown' | 'markup' | 'matlab' | 'mermaid' | 'nix' | 'objective-c' | 'ocaml' | 'pascal' | 'perl' | 'php' | 'plain text' | 'powershell' | 'prolog' | 'protobuf' | 'python' | 'r' | 'reason' | 'ruby' | 'rust' | 'sass' | 'scala' | 'scheme' | 'scss' | 'shell' | 'sql' | 'swift' | 'typescript' | 'vb.net' | 'verilog' | 'vhdl' | 'visual basic' | 'webassembly' | 'xml' | 'yaml' | 'java/c/c++/c#'): {
        type: string;
        code: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
            language: "json" | "abap" | "arduino" | "bash" | "basic" | "c" | "clojure" | "coffeescript" | "c++" | "c#" | "css" | "dart" | "diff" | "docker" | "elixir" | "elm" | "erlang" | "flow" | "fortran" | "f#" | "gherkin" | "glsl" | "go" | "graphql" | "groovy" | "haskell" | "html" | "java" | "javascript" | "julia" | "kotlin" | "latex" | "less" | "lisp" | "livescript" | "lua" | "makefile" | "markdown" | "markup" | "matlab" | "mermaid" | "nix" | "objective-c" | "ocaml" | "pascal" | "perl" | "php" | "plain text" | "powershell" | "prolog" | "protobuf" | "python" | "r" | "reason" | "ruby" | "rust" | "sass" | "scala" | "scheme" | "scss" | "shell" | "sql" | "swift" | "typescript" | "vb.net" | "verilog" | "vhdl" | "visual basic" | "webassembly" | "xml" | "yaml" | "java/c/c++/c#";
        };
    };
    /**
     * Create a quote block
     * @param text Quote text
     */
    createQuote(text: string): {
        type: string;
        quote: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
        };
    };
    /**
     * Create a divider block
     */
    createDivider(): {
        type: string;
        divider: {};
    };
    /**
     * Create a callout block
     * @param text Callout text
     * @param emoji Emoji icon
     */
    createCallout(text: string, emoji: string): {
        type: string;
        callout: {
            rich_text: {
                type: string;
                text: {
                    content: string;
                };
            }[];
            icon: {
                type: string;
                emoji: string;
            };
        };
    };
    /**
     * Create a bookmark block
     * @param url Bookmark URL
     * @param caption Optional caption
     */
    createBookmark(url: string, caption?: string): any;
    /**
     * Create an image block
     * @param url Image URL
     * @param caption Optional caption
     */
    createImage(url: string, caption?: string): any;
    /**
     * Create a table block
     * @param rows Number of rows
     * @param columns Number of columns
     * @param hasColumnHeader Whether to include a column header
     * @param hasRowHeader Whether to include a row header
     */
    createTable(rows: number, columns: number, hasColumnHeader?: boolean, hasRowHeader?: boolean): {
        type: string;
        table: {
            table_width: number;
            has_column_header: boolean;
            has_row_header: boolean;
            children: never[];
        };
    };
    /**
     * Create a table row block
     * @param cells Cell contents
     */
    createTableRow(cells: string[]): {
        type: string;
        table_row: {
            cells: {
                type: string;
                text: {
                    content: string;
                };
            }[][];
        };
    };
    /**
     * Create a database property
     * @param type Property type
     * @param options Property options
     */
    createDatabaseProperty(type: string, options?: Record<string, any>): Record<string, any>;
}
