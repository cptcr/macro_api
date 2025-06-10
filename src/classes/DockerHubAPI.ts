import axios, { AxiosResponse } from 'axios';
import { handleAxiosError, toPaginationParams } from '../utils/errorHandling';

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
  } | null;
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
export class DockerHubAPI {
  private readonly token: string;
  private readonly namespace?: string;
  private readonly baseUrl = 'https://hub.docker.com/v2';

  constructor(config: DockerHubConfig) {
    if (!config.token) {
      throw new Error('Docker Hub token is required');
    }
    
    this.token = config.token;
    this.namespace = config.namespace;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown>,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...customHeaders
      };

      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers,
        timeout: 30000
      });

      return response.data;
    } catch (error: unknown) {
      handleAxiosError(error, 'Docker Hub');
    }
  }

  /**
   * Get repository information
   */
  async getRepository(name: string): Promise<Repository> {
    const [namespace, repo] = this.parseRepositoryName(name);
    return this.request<Repository>('GET', `/repositories/${namespace}/${repo}/`);
  }

  /**
   * List repositories for user or organization
   */
  async listRepositories(namespace?: string, options?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ count: number; next?: string; previous?: string; results: Repository[] }> {
    const ns = namespace || this.namespace || 'library';
    const params = new URLSearchParams();
    
    if (options?.page) params.set('page', options.page.toString());
    if (options?.pageSize) params.set('page_size', options.pageSize.toString());

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/repositories/${ns}/?${queryString}`
      : `/repositories/${ns}/`;

    return this.request<{ count: number; next?: string; previous?: string; results: Repository[] }>('GET', endpoint);
  }

  /**
   * Create a new repository
   */
  async createRepository(name: string, options?: {
    description?: string;
    fullDescription?: string;
    isPrivate?: boolean;
  }): Promise<Repository> {
    const [namespace, repo] = this.parseRepositoryName(name);
    
    const data: Record<string, unknown> = {
      name: repo,
      namespace,
      description: options?.description || '',
      full_description: options?.fullDescription || '',
      is_private: options?.isPrivate || false
    };

    return this.request<Repository>('POST', '/repositories/', data);
  }

  /**
   * Update repository information
   */
  async updateRepository(name: string, updates: {
    description?: string;
    fullDescription?: string;
    isPrivate?: boolean;
  }): Promise<Repository> {
    const [namespace, repo] = this.parseRepositoryName(name);
    
    const data: Record<string, unknown> = {};
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.fullDescription !== undefined) data.full_description = updates.fullDescription;
    if (updates.isPrivate !== undefined) data.is_private = updates.isPrivate;

    return this.request<Repository>('PATCH', `/repositories/${namespace}/${repo}/`, data);
  }

  /**
   * Delete a repository
   */
  async deleteRepository(name: string): Promise<void> {
    const [namespace, repo] = this.parseRepositoryName(name);
    await this.request<void>('DELETE', `/repositories/${namespace}/${repo}/`);
  }

  /**
   * List tags for a repository
   */
  async listTags(repository: string, options?: TagOptions): Promise<{ count: number; next?: string; previous?: string; results: Tag[] }> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const params = new URLSearchParams();
    
    if (options?.page) params.set('page', options.page.toString());
    if (options?.pageSize) params.set('page_size', options.pageSize.toString());
    if (options?.ordering) params.set('ordering', options.ordering);

    const queryString = params.toString();
    const endpoint = queryString 
      ? `/repositories/${namespace}/${repo}/tags/?${queryString}`
      : `/repositories/${namespace}/${repo}/tags/`;

    return this.request<{ count: number; next?: string; previous?: string; results: Tag[] }>('GET', endpoint);
  }

  /**
   * Get detailed information about a specific tag
   */
  async getTagDetails(repository: string, tag: string): Promise<TagDetails> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    return this.request<TagDetails>('GET', `/repositories/${namespace}/${repo}/tags/${tag}/`);
  }

  /**
   * Delete a tag
   */
  async deleteTag(repository: string, tag: string): Promise<DeleteResult> {
    try {
      const [namespace, repo] = this.parseRepositoryName(repository);
      await this.request<void>('DELETE', `/repositories/${namespace}/${repo}/tags/${tag}/`);
      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete tag'
      };
    }
  }

  /**
   * Search repositories
   */
  async searchRepositories(query: string, options?: SearchOptions): Promise<{ count: number; next?: string; previous?: string; results: SearchResult[] }> {
    const params = new URLSearchParams();
    params.set('q', query);
    
    if (options?.limit) params.set('page_size', options.limit.toString());
    
    // Add filters
    if (options?.filters) {
      if (options.filters.isOfficial !== undefined) {
        params.set('is_official', options.filters.isOfficial.toString());
      }
      if (options.filters.isAutomated !== undefined) {
        params.set('is_automated', options.filters.isAutomated.toString());
      }
      if (options.filters.starCount !== undefined) {
        params.set('star_count__gte', options.filters.starCount.toString());
      }
    }

    return this.request<{ count: number; next?: string; previous?: string; results: SearchResult[] }>('GET', `/search/repositories/?${params.toString()}`);
  }

  /**
   * Get download statistics for a repository
   */
  async getDownloadStats(repository: string, _timeframe?: 'day' | 'week' | 'month'): Promise<DownloadStats> {
    // Docker Hub doesn't provide detailed stats via public API
    // This is a simplified implementation that gets basic pull count
    const repoInfo = await this.getRepository(repository);
    
    const stats: DownloadStats = {
      total_downloads: repoInfo.pullCount,
      daily_downloads: 0,
      weekly_downloads: 0,
      monthly_downloads: 0,
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString()
    };

    // Estimate recent downloads based on timeframe
    const now = Date.now();
    const lastUpdated = new Date(repoInfo.lastUpdated).getTime();
    const daysSinceUpdate = Math.max(1, Math.floor((now - lastUpdated) / (24 * 60 * 60 * 1000)));
    
    // Simple estimation (in production, you'd use actual analytics data)
    const estimatedDailyDownloads = Math.floor(repoInfo.pullCount / Math.max(daysSinceUpdate, 30));
    
    stats.daily_downloads = estimatedDailyDownloads;
    stats.weekly_downloads = estimatedDailyDownloads * 7;
    stats.monthly_downloads = estimatedDailyDownloads * 30;

    return stats;
  }

  /**
   * Star a repository
   */
  async starRepository(repository: string): Promise<void> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    await this.request<void>('POST', `/repositories/${namespace}/${repo}/stars/`);
  }

  /**
   * Unstar a repository
   */
  async unstarRepository(repository: string): Promise<void> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    await this.request<void>('DELETE', `/repositories/${namespace}/${repo}/stars/`);
  }

  /**
   * Get repository build triggers (for automated builds)
   */
  async getBuildTriggers(repository: string): Promise<BuildTrigger[]> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const response = await this.request<{ results: BuildTrigger[] }>('GET', `/repositories/${namespace}/${repo}/autobuild/`);
    return response.results;
  }

  /**
   * Create a build trigger
   */
  async createBuildTrigger(repository: string, trigger: {
    name: string;
    sourceType: 'Branch' | 'Tag';
    sourceName: string;
    dockerfileLocation?: string;
    buildContext?: string;
    tag: string;
    buildArgs?: Record<string, string>;
  }): Promise<BuildTrigger> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const data = {
      name: trigger.name,
      source_type: trigger.sourceType,
      source_name: trigger.sourceName,
      dockerfile_location: trigger.dockerfileLocation || '/',
      build_context: trigger.buildContext || '/',
      tag: trigger.tag,
      build_settings: {
        build_args: trigger.buildArgs || {},
        build_cache: true
      }
    };

    return this.request<BuildTrigger>('POST', `/repositories/${namespace}/${repo}/autobuild/`, data);
  }

  /**
   * Delete a build trigger
   */
  async deleteBuildTrigger(repository: string, triggerId: string): Promise<void> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    await this.request<void>('DELETE', `/repositories/${namespace}/${repo}/autobuild/${triggerId}/`);
  }

  /**
   * Trigger a build
   */
  async triggerBuild(repository: string, options?: {
    sourceType?: 'Branch' | 'Tag';
    sourceName?: string;
  }): Promise<{ build_tag: string; request_id: string }> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const data: Record<string, unknown> = {};
    if (options?.sourceType) data.source_type = options.sourceType;
    if (options?.sourceName) data.source_name = options.sourceName;

    return this.request<{ build_tag: string; request_id: string }>('POST', `/repositories/${namespace}/${repo}/autobuild/trigger/`, data);
  }

  /**
   * Get repository webhooks
   */
  async getWebhooks(repository: string): Promise<WebhookConfig[]> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const response = await this.request<{ results: WebhookConfig[] }>('GET', `/repositories/${namespace}/${repo}/webhooks/`);
    return response.results;
  }

  /**
   * Create a webhook
   */
  async createWebhook(repository: string, webhook: {
    name: string;
    webhookUrl: string;
    expectFinalCallback?: boolean;
  }): Promise<WebhookConfig> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const data = {
      name: webhook.name,
      webhook_url: webhook.webhookUrl,
      expect_final_callback: webhook.expectFinalCallback || false
    };

    return this.request<WebhookConfig>('POST', `/repositories/${namespace}/${repo}/webhooks/`, data);
  }

  /**
   * Update a webhook
   */
  async updateWebhook(repository: string, webhookId: string, updates: {
    name?: string;
    webhookUrl?: string;
    active?: boolean;
    expectFinalCallback?: boolean;
  }): Promise<WebhookConfig> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    const data: Record<string, unknown> = {};
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.webhookUrl !== undefined) data.webhook_url = updates.webhookUrl;
    if (updates.active !== undefined) data.active = updates.active;
    if (updates.expectFinalCallback !== undefined) data.expect_final_callback = updates.expectFinalCallback;

    return this.request<WebhookConfig>('PATCH', `/repositories/${namespace}/${repo}/webhooks/${webhookId}/`, data);
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(repository: string, webhookId: string): Promise<void> {
    const [namespace, repo] = this.parseRepositoryName(repository);
    await this.request<void>('DELETE', `/repositories/${namespace}/${repo}/webhooks/${webhookId}/`);
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('GET', '/user/');
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(): Promise<Record<string, unknown>[]> {
    const response = await this.request<{ results: Record<string, unknown>[] }>('GET', '/user/orgs/');
    return response.results;
  }

  /**
   * Parse repository name into namespace and repository
   */
  private parseRepositoryName(name: string): [string, string] {
    const parts = name.split('/');
    
    if (parts.length === 1) {
      // If no namespace provided, use the configured namespace or 'library' for official images
      return [this.namespace || 'library', parts[0]];
    } else if (parts.length === 2) {
      return [parts[0], parts[1]];
    } else {
      throw new Error(`Invalid repository name format: ${name}. Expected format: 'namespace/repository' or 'repository'`);
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error: unknown) {
      return false;
    }
  }

  /**
   * Get repository vulnerability scan results (if available)
   */
  async getVulnerabilityReport(repository: string, tag: string): Promise<Record<string, unknown> | null> {
    try {
      const tagDetails = await this.getTagDetails(repository, tag);
      return tagDetails.vulnerabilities || null;
    } catch (error: unknown) {
      return null;
    }
  }

  /**
   * Get repository manifest
   */
  async getManifest(repository: string, tag: string): Promise<Record<string, unknown>> {
    try {
      const [namespace, repo] = this.parseRepositoryName(repository);
      return this.request<Record<string, unknown>>('GET', `/repositories/${namespace}/${repo}/tags/${tag}/images/`);
    } catch (error: unknown) {
      handleAxiosError(error, 'Docker Hub');
    }
  }

  /**
   * Check if repository exists
   */
  async repositoryExists(name: string): Promise<boolean> {
    try {
      await this.getRepository(name);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if tag exists
   */
  async tagExists(repository: string, tag: string): Promise<boolean> {
    try {
      await this.getTagDetails(repository, tag);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }
}