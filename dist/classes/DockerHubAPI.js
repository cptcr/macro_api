"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DockerHubAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Production-ready Docker Hub API wrapper for container registry management
 */
class DockerHubAPI {
    constructor(config) {
        this.baseUrl = 'https://hub.docker.com/v2';
        if (!config.token) {
            throw new Error('Docker Hub token is required');
        }
        this.token = config.token;
        this.namespace = config.namespace;
    }
    async request(method, endpoint, data, customHeaders) {
        try {
            const headers = {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...customHeaders
            };
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}${endpoint}`,
                data,
                headers,
                timeout: 30000
            });
            return response.data;
        }
        catch (error) {
            this.handleDockerHubError(error);
            throw error;
        }
    }
    handleDockerHubError(error) {
        if (error.response?.data?.detail) {
            throw new Error(`Docker Hub API Error: ${error.response.data.detail}`);
        }
        else if (error.response?.data?.message) {
            throw new Error(`Docker Hub API Error: ${error.response.data.message}`);
        }
        else if (error.response?.status) {
            throw new Error(`Docker Hub API Error: HTTP ${error.response.status} - ${error.response.statusText}`);
        }
    }
    /**
     * Get repository information
     */
    async getRepository(name) {
        const [namespace, repo] = this.parseRepositoryName(name);
        return this.request('GET', `/repositories/${namespace}/${repo}/`);
    }
    /**
     * List repositories for user or organization
     */
    async listRepositories(namespace, options) {
        const ns = namespace || this.namespace || 'library';
        const params = new URLSearchParams();
        if (options?.page)
            params.set('page', options.page.toString());
        if (options?.pageSize)
            params.set('page_size', options.pageSize.toString());
        const queryString = params.toString();
        const endpoint = queryString
            ? `/repositories/${ns}/?${queryString}`
            : `/repositories/${ns}/`;
        return this.request('GET', endpoint);
    }
    /**
     * Create a new repository
     */
    async createRepository(name, options) {
        const [namespace, repo] = this.parseRepositoryName(name);
        const data = {
            name: repo,
            namespace,
            description: options?.description || '',
            full_description: options?.fullDescription || '',
            is_private: options?.isPrivate || false
        };
        return this.request('POST', '/repositories/', data);
    }
    /**
     * Update repository information
     */
    async updateRepository(name, updates) {
        const [namespace, repo] = this.parseRepositoryName(name);
        const data = {};
        if (updates.description !== undefined)
            data.description = updates.description;
        if (updates.fullDescription !== undefined)
            data.full_description = updates.fullDescription;
        if (updates.isPrivate !== undefined)
            data.is_private = updates.isPrivate;
        return this.request('PATCH', `/repositories/${namespace}/${repo}/`, data);
    }
    /**
     * Delete a repository
     */
    async deleteRepository(name) {
        const [namespace, repo] = this.parseRepositoryName(name);
        await this.request('DELETE', `/repositories/${namespace}/${repo}/`);
    }
    /**
     * List tags for a repository
     */
    async listTags(repository, options) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        const params = new URLSearchParams();
        if (options?.page)
            params.set('page', options.page.toString());
        if (options?.pageSize)
            params.set('page_size', options.pageSize.toString());
        if (options?.ordering)
            params.set('ordering', options.ordering);
        const queryString = params.toString();
        const endpoint = queryString
            ? `/repositories/${namespace}/${repo}/tags/?${queryString}`
            : `/repositories/${namespace}/${repo}/tags/`;
        return this.request('GET', endpoint);
    }
    /**
     * Get detailed information about a specific tag
     */
    async getTagDetails(repository, tag) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        return this.request('GET', `/repositories/${namespace}/${repo}/tags/${tag}/`);
    }
    /**
     * Delete a tag
     */
    async deleteTag(repository, tag) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        try {
            await this.request('DELETE', `/repositories/${namespace}/${repo}/tags/${tag}/`);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete tag'
            };
        }
    }
    /**
     * Search repositories
     */
    async searchRepositories(query, options) {
        const params = new URLSearchParams();
        params.set('q', query);
        if (options?.limit)
            params.set('page_size', options.limit.toString());
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
        return this.request('GET', `/search/repositories/?${params.toString()}`);
    }
    /**
     * Get download statistics for a repository
     */
    async getDownloadStats(repository, timeframe) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        // Docker Hub doesn't provide detailed stats via public API
        // This is a simplified implementation that gets basic pull count
        const repoInfo = await this.getRepository(repository);
        const stats = {
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
    async starRepository(repository) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        await this.request('POST', `/repositories/${namespace}/${repo}/stars/`);
    }
    /**
     * Unstar a repository
     */
    async unstarRepository(repository) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        await this.request('DELETE', `/repositories/${namespace}/${repo}/stars/`);
    }
    /**
     * Get repository build triggers (for automated builds)
     */
    async getBuildTriggers(repository) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        const response = await this.request('GET', `/repositories/${namespace}/${repo}/autobuild/`);
        return response.results;
    }
    /**
     * Create a build trigger
     */
    async createBuildTrigger(repository, trigger) {
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
        return this.request('POST', `/repositories/${namespace}/${repo}/autobuild/`, data);
    }
    /**
     * Delete a build trigger
     */
    async deleteBuildTrigger(repository, triggerId) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        await this.request('DELETE', `/repositories/${namespace}/${repo}/autobuild/${triggerId}/`);
    }
    /**
     * Trigger a build
     */
    async triggerBuild(repository, options) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        const data = {};
        if (options?.sourceType)
            data.source_type = options.sourceType;
        if (options?.sourceName)
            data.source_name = options.sourceName;
        return this.request('POST', `/repositories/${namespace}/${repo}/autobuild/trigger/`, data);
    }
    /**
     * Get repository webhooks
     */
    async getWebhooks(repository) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        const response = await this.request('GET', `/repositories/${namespace}/${repo}/webhooks/`);
        return response.results;
    }
    /**
     * Create a webhook
     */
    async createWebhook(repository, webhook) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        const data = {
            name: webhook.name,
            webhook_url: webhook.webhookUrl,
            expect_final_callback: webhook.expectFinalCallback || false
        };
        return this.request('POST', `/repositories/${namespace}/${repo}/webhooks/`, data);
    }
    /**
     * Update a webhook
     */
    async updateWebhook(repository, webhookId, updates) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        const data = {};
        if (updates.name !== undefined)
            data.name = updates.name;
        if (updates.webhookUrl !== undefined)
            data.webhook_url = updates.webhookUrl;
        if (updates.active !== undefined)
            data.active = updates.active;
        if (updates.expectFinalCallback !== undefined)
            data.expect_final_callback = updates.expectFinalCallback;
        return this.request('PATCH', `/repositories/${namespace}/${repo}/webhooks/${webhookId}/`, data);
    }
    /**
     * Delete a webhook
     */
    async deleteWebhook(repository, webhookId) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        await this.request('DELETE', `/repositories/${namespace}/${repo}/webhooks/${webhookId}/`);
    }
    /**
     * Get current user information
     */
    async getCurrentUser() {
        return this.request('GET', '/user/');
    }
    /**
     * Get user's organizations
     */
    async getUserOrganizations() {
        const response = await this.request('GET', '/user/orgs/');
        return response.results;
    }
    /**
     * Parse repository name into namespace and repository
     */
    parseRepositoryName(name) {
        const parts = name.split('/');
        if (parts.length === 1) {
            // If no namespace provided, use the configured namespace or 'library' for official images
            return [this.namespace || 'library', parts[0]];
        }
        else if (parts.length === 2) {
            return [parts[0], parts[1]];
        }
        else {
            throw new Error(`Invalid repository name format: ${name}. Expected format: 'namespace/repository' or 'repository'`);
        }
    }
    /**
     * Validate repository name
     */
    validateRepositoryName(name) {
        // Docker repository names must be lowercase and can contain letters, digits, hyphens, underscores, and periods
        const repositoryRegex = /^[a-z0-9._-]+$/;
        const [namespace, repo] = this.parseRepositoryName(name);
        return repositoryRegex.test(namespace) && repositoryRegex.test(repo);
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            await this.getCurrentUser();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get repository vulnerability scan results (if available)
     */
    async getVulnerabilityReport(repository, tag) {
        try {
            const tagDetails = await this.getTagDetails(repository, tag);
            return tagDetails.vulnerabilities || null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get repository manifest
     */
    async getManifest(repository, tag) {
        const [namespace, repo] = this.parseRepositoryName(repository);
        try {
            return this.request('GET', `/repositories/${namespace}/${repo}/tags/${tag}/images/`);
        }
        catch (error) {
            throw new Error(`Failed to get manifest for ${repository}:${tag}`);
        }
    }
    /**
     * Check if repository exists
     */
    async repositoryExists(name) {
        try {
            await this.getRepository(name);
            return true;
        }
        catch (error) {
            if (error.message?.includes('404')) {
                return false;
            }
            throw error;
        }
    }
    /**
     * Check if tag exists
     */
    async tagExists(repository, tag) {
        try {
            await this.getTagDetails(repository, tag);
            return true;
        }
        catch (error) {
            if (error.message?.includes('404')) {
                return false;
            }
            throw error;
        }
    }
}
exports.DockerHubAPI = DockerHubAPI;
