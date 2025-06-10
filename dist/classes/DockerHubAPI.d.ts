export interface DockerHubConfig {
    token: string;
    namespace?: string;
}
export interface Repository {
    user: string;
    name: string;
    namespace: string;
    repositoryType: 'image';
    status: number;
    statusDescription: string;
    description: string;
    isPrivate: boolean;
    isAutomated: boolean;
    canEdit: boolean;
    starCount: number;
    pullCount: number;
    lastUpdated: string;
    hasStarred: boolean;
    fullDescription: string;
    affiliation: string;
    permissions: {
        read: boolean;
        write: boolean;
        admin: boolean;
    };
}
export interface Tag {
    creator: number;
    id: number;
    imageId?: string;
    images: Array<{
        architecture: string;
        features: string;
        variant?: string;
        digest: string;
        os: string;
        osFeatures: string;
        osVersion?: string;
        size: number;
        status: string;
        lastPulled?: string;
        lastPushed: string;
    }>;
    lastUpdated: string;
    lastUpdater: number;
    lastUpdaterUsername: string;
    name: string;
    repository: number;
    fullSize: number;
    v2: boolean;
    tagStatus: string;
    tagLastPulled?: string;
    tagLastPushed: string;
    mediaType: string;
    contentType: string;
    digest: string;
}
export interface TagDetails {
    creator: number;
    id: number;
    imageId?: string;
    images: Array<{
        architecture: string;
        features: string;
        variant?: string;
        digest: string;
        os: string;
        osFeatures: string;
        osVersion?: string;
        size: number;
        status: string;
        lastPulled?: string;
        lastPushed: string;
        layers: Array<{
            instruction: string;
            digest: string;
            size: number;
        }>;
    }>;
    lastUpdated: string;
    lastUpdater: number;
    lastUpdaterUsername: string;
    name: string;
    repository: number;
    fullSize: number;
    v2: boolean;
    tagStatus: string;
    tagLastPulled?: string;
    tagLastPushed: string;
    mediaType: string;
    contentType: string;
    digest: string;
    vulnerabilities?: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        unknown: number;
    };
}
export interface TagOptions {
    page?: number;
    pageSize?: number;
    ordering?: 'last_updated' | '-last_updated' | 'name' | '-name';
}
export interface SearchOptions {
    limit?: number;
    filters?: {
        isOfficial?: boolean;
        isAutomated?: boolean;
        starCount?: number;
    };
}
export interface SearchResult {
    user: string;
    name: string;
    namespace: string;
    repositoryType: string;
    status: number;
    statusDescription: string;
    description: string;
    isPrivate: boolean;
    isAutomated: boolean;
    canEdit: boolean;
    starCount: number;
    pullCount: number;
    lastUpdated: string;
    dateRegistered: string;
    collaboratorCount: number;
    affiliation?: string;
    hubUser: string;
    hasStarred: boolean;
    fullDescription: string;
    permissions: {
        read: boolean;
        write: boolean;
        admin: boolean;
    };
}
export interface DeleteResult {
    success: boolean;
    message?: string;
}
export interface DownloadStats {
    total_downloads: number;
    daily_downloads: number;
    weekly_downloads: number;
    monthly_downloads: number;
    period_start: string;
    period_end: string;
    breakdown_by_date?: Array<{
        date: string;
        downloads: number;
    }>;
    breakdown_by_country?: Array<{
        country: string;
        downloads: number;
    }>;
}
export interface BuildTrigger {
    id: string;
    name: string;
    source_type: 'Branch' | 'Tag';
    source_name: string;
    dockerfile_location: string;
    build_context: string;
    tag: string;
    status: 'Active' | 'Inactive';
    build_settings: {
        build_args: Record<string, string>;
        build_cache: boolean;
    };
}
export interface WebhookConfig {
    id: string;
    name: string;
    webhook_url: string;
    active: boolean;
    expect_final_callback: boolean;
    created_date: string;
    last_updated: string;
    last_called: string;
    creator: string;
}
/**
 * Production-ready Docker Hub API wrapper for container registry management
 */
export declare class DockerHubAPI {
    private readonly token;
    private readonly namespace?;
    private readonly baseUrl;
    constructor(config: DockerHubConfig);
    private request;
    private handleDockerHubError;
    /**
     * Get repository information
     */
    getRepository(name: string): Promise<Repository>;
    /**
     * List repositories for user or organization
     */
    listRepositories(namespace?: string, options?: {
        page?: number;
        pageSize?: number;
    }): Promise<{
        count: number;
        next?: string;
        previous?: string;
        results: Repository[];
    }>;
    /**
     * Create a new repository
     */
    createRepository(name: string, options?: {
        description?: string;
        fullDescription?: string;
        isPrivate?: boolean;
    }): Promise<Repository>;
    /**
     * Update repository information
     */
    updateRepository(name: string, updates: {
        description?: string;
        fullDescription?: string;
        isPrivate?: boolean;
    }): Promise<Repository>;
    /**
     * Delete a repository
     */
    deleteRepository(name: string): Promise<void>;
    /**
     * List tags for a repository
     */
    listTags(repository: string, options?: TagOptions): Promise<{
        count: number;
        next?: string;
        previous?: string;
        results: Tag[];
    }>;
    /**
     * Get detailed information about a specific tag
     */
    getTagDetails(repository: string, tag: string): Promise<TagDetails>;
    /**
     * Delete a tag
     */
    deleteTag(repository: string, tag: string): Promise<DeleteResult>;
    /**
     * Search repositories
     */
    searchRepositories(query: string, options?: SearchOptions): Promise<{
        count: number;
        next?: string;
        previous?: string;
        results: SearchResult[];
    }>;
    /**
     * Get download statistics for a repository
     */
    getDownloadStats(repository: string, timeframe?: 'day' | 'week' | 'month'): Promise<DownloadStats>;
    /**
     * Star a repository
     */
    starRepository(repository: string): Promise<void>;
    /**
     * Unstar a repository
     */
    unstarRepository(repository: string): Promise<void>;
    /**
     * Get repository build triggers (for automated builds)
     */
    getBuildTriggers(repository: string): Promise<BuildTrigger[]>;
    /**
     * Create a build trigger
     */
    createBuildTrigger(repository: string, trigger: {
        name: string;
        sourceType: 'Branch' | 'Tag';
        sourceName: string;
        dockerfileLocation?: string;
        buildContext?: string;
        tag: string;
        buildArgs?: Record<string, string>;
    }): Promise<BuildTrigger>;
    /**
     * Delete a build trigger
     */
    deleteBuildTrigger(repository: string, triggerId: string): Promise<void>;
    /**
     * Trigger a build
     */
    triggerBuild(repository: string, options?: {
        sourceType?: 'Branch' | 'Tag';
        sourceName?: string;
    }): Promise<{
        build_tag: string;
        request_id: string;
    }>;
    /**
     * Get repository webhooks
     */
    getWebhooks(repository: string): Promise<WebhookConfig[]>;
    /**
     * Create a webhook
     */
    createWebhook(repository: string, webhook: {
        name: string;
        webhookUrl: string;
        expectFinalCallback?: boolean;
    }): Promise<WebhookConfig>;
    /**
     * Update a webhook
     */
    updateWebhook(repository: string, webhookId: string, updates: {
        name?: string;
        webhookUrl?: string;
        active?: boolean;
        expectFinalCallback?: boolean;
    }): Promise<WebhookConfig>;
    /**
     * Delete a webhook
     */
    deleteWebhook(repository: string, webhookId: string): Promise<void>;
    /**
     * Get current user information
     */
    getCurrentUser(): Promise<any>;
    /**
     * Get user's organizations
     */
    getUserOrganizations(): Promise<any[]>;
    /**
     * Parse repository name into namespace and repository
     */
    private parseRepositoryName;
    /**
     * Validate repository name
     */
    private validateRepositoryName;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Get repository vulnerability scan results (if available)
     */
    getVulnerabilityReport(repository: string, tag: string): Promise<any>;
    /**
     * Get repository manifest
     */
    getManifest(repository: string, tag: string): Promise<any>;
    /**
     * Check if repository exists
     */
    repositoryExists(name: string): Promise<boolean>;
    /**
     * Check if tag exists
     */
    tagExists(repository: string, tag: string): Promise<boolean>;
}
