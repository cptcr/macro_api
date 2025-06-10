"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VercelAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Production-ready Vercel API wrapper for deployment automation & project management
 */
class VercelAPI {
    constructor(config) {
        this.baseUrl = 'https://api.vercel.com';
        if (!config.accessToken) {
            throw new Error('Vercel access token is required');
        }
        this.accessToken = config.accessToken;
        this.teamId = config.teamId;
    }
    async request(method, endpoint, data, customHeaders) {
        try {
            const headers = {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...customHeaders
            };
            const url = new URL(`${this.baseUrl}${endpoint}`);
            if (this.teamId) {
                url.searchParams.set('teamId', this.teamId);
            }
            const response = await (0, axios_1.default)({
                method,
                url: url.toString(),
                data,
                headers,
                timeout: 60000 // Longer timeout for deployment operations
            });
            return response.data;
        }
        catch (error) {
            this.handleVercelError(error);
            throw error;
        }
    }
    handleVercelError(error) {
        if (error.response?.data?.error) {
            const vercelError = error.response.data.error;
            throw new Error(`Vercel API Error: ${vercelError.message || vercelError.code || 'Unknown error'}`);
        }
    }
    /**
     * Create a new deployment
     */
    async createDeployment(options) {
        if (!options.name && !options.gitSource) {
            throw new Error('Either deployment name or git source is required');
        }
        const deploymentData = {
            name: options.name,
            deploymentId: this.generateDeploymentId()
        };
        if (options.gitSource) {
            deploymentData.gitSource = {
                type: options.gitSource.type,
                repo: options.gitSource.repo,
                ref: options.gitSource.ref || 'main'
            };
            if (options.gitSource.sha) {
                deploymentData.gitSource.sha = options.gitSource.sha;
            }
        }
        if (options.files && options.files.length > 0) {
            deploymentData.files = options.files.map(file => ({
                file: file.file,
                data: typeof file.data === 'string' ? file.data : file.data.toString('base64'),
                encoding: file.encoding || (typeof file.data === 'string' ? 'utf8' : 'base64')
            }));
        }
        if (options.env) {
            deploymentData.env = Object.entries(options.env).map(([key, value]) => ({
                key,
                value
            }));
        }
        if (options.buildCommand)
            deploymentData.buildCommand = options.buildCommand;
        if (options.outputDirectory)
            deploymentData.outputDirectory = options.outputDirectory;
        if (options.installCommand)
            deploymentData.installCommand = options.installCommand;
        if (options.devCommand)
            deploymentData.devCommand = options.devCommand;
        if (options.regions)
            deploymentData.regions = options.regions;
        if (options.functions)
            deploymentData.functions = options.functions;
        if (options.routes)
            deploymentData.routes = options.routes;
        if (options.cleanUrls !== undefined)
            deploymentData.cleanUrls = options.cleanUrls;
        if (options.trailingSlash !== undefined)
            deploymentData.trailingSlash = options.trailingSlash;
        if (options.redirects)
            deploymentData.redirects = options.redirects;
        if (options.headers)
            deploymentData.headers = options.headers;
        if (options.rewrites)
            deploymentData.rewrites = options.rewrites;
        // Set target to production by default
        deploymentData.target = 'production';
        deploymentData.projectSettings = {
            framework: options.gitSource ? this.detectFramework(options.gitSource.repo) : null
        };
        return this.request('POST', '/v13/deployments', deploymentData);
    }
    /**
     * Get deployment by ID
     */
    async getDeployment(deploymentId) {
        return this.request('GET', `/v13/deployments/${deploymentId}`);
    }
    /**
     * List deployments
     */
    async listDeployments(options) {
        const params = {};
        if (options?.app)
            params.app = options.app;
        if (options?.from)
            params.from = options.from;
        if (options?.limit)
            params.limit = options.limit;
        if (options?.since)
            params.since = options.since;
        if (options?.until)
            params.until = options.until;
        if (options?.state)
            params.state = options.state;
        if (options?.target)
            params.target = options.target;
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/v6/deployments?${queryString}` : '/v6/deployments';
        return this.request('GET', endpoint);
    }
    /**
     * Cancel a deployment
     */
    async cancelDeployment(deploymentId) {
        return this.request('PATCH', `/v12/deployments/${deploymentId}/cancel`);
    }
    /**
     * Get project by ID or name
     */
    async getProject(projectIdOrName) {
        return this.request('GET', `/v9/projects/${encodeURIComponent(projectIdOrName)}`);
    }
    /**
     * List projects
     */
    async listProjects(options) {
        const params = {};
        if (options?.from)
            params.from = options.from;
        if (options?.limit)
            params.limit = options.limit;
        if (options?.search)
            params.search = options.search;
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/v9/projects?${queryString}` : '/v9/projects';
        return this.request('GET', endpoint);
    }
    /**
     * Create a new project
     */
    async createProject(name, options) {
        const projectData = { name };
        if (options) {
            Object.assign(projectData, options);
        }
        return this.request('POST', '/v9/projects', projectData);
    }
    /**
     * Update project
     */
    async updateProject(projectId, updates) {
        return this.request('PATCH', `/v9/projects/${projectId}`, updates);
    }
    /**
     * Delete project
     */
    async deleteProject(projectId) {
        await this.request('DELETE', `/v9/projects/${projectId}`);
    }
    /**
     * Get environment variables for a project
     */
    async getEnvironmentVariables(projectId) {
        return this.request('GET', `/v9/projects/${projectId}/env`);
    }
    /**
     * Create environment variable
     */
    async createEnvironmentVariable(projectId, key, value, target) {
        const envData = {
            key,
            value,
            target,
            type: 'encrypted'
        };
        return this.request('POST', `/v9/projects/${projectId}/env`, envData);
    }
    /**
     * Update environment variable
     */
    async updateEnvironmentVariable(projectId, envId, updates) {
        return this.request('PATCH', `/v9/projects/${projectId}/env/${envId}`, updates);
    }
    /**
     * Delete environment variable
     */
    async deleteEnvironmentVariable(projectId, envId) {
        await this.request('DELETE', `/v9/projects/${projectId}/env/${envId}`);
    }
    /**
     * Get domains for a project
     */
    async getDomains(projectId) {
        const response = await this.request('GET', `/v9/projects/${projectId}/domains`);
        return response.domains;
    }
    /**
     * Add domain to project
     */
    async addDomain(projectId, name, options) {
        const domainData = { name };
        if (options) {
            Object.assign(domainData, options);
        }
        return this.request('POST', `/v9/projects/${projectId}/domains`, domainData);
    }
    /**
     * Remove domain from project
     */
    async removeDomain(projectId, domain) {
        await this.request('DELETE', `/v9/projects/${projectId}/domains/${domain}`);
    }
    /**
     * Verify domain
     */
    async verifyDomain(projectId, domain) {
        return this.request('POST', `/v9/projects/${projectId}/domains/${domain}/verify`);
    }
    /**
     * Get deployment logs
     */
    async getDeploymentLogs(deploymentId, options) {
        const params = {};
        if (options?.direction)
            params.direction = options.direction;
        if (options?.follow !== undefined)
            params.follow = options.follow;
        if (options?.limit)
            params.limit = options.limit;
        if (options?.since)
            params.since = options.since;
        if (options?.until)
            params.until = options.until;
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString
            ? `/v2/deployments/${deploymentId}/events?${queryString}`
            : `/v2/deployments/${deploymentId}/events`;
        return this.request('GET', endpoint);
    }
    /**
     * Get deployment files
     */
    async getDeploymentFiles(deploymentId) {
        const response = await this.request('GET', `/v6/deployments/${deploymentId}/files`);
        return response.files;
    }
    /**
     * Get current user/team information
     */
    async getCurrentUser() {
        return this.request('GET', '/v2/user');
    }
    /**
     * Get team information (if using team token)
     */
    async getTeam() {
        if (!this.teamId) {
            throw new Error('Team ID is required for team operations');
        }
        return this.request('GET', `/v2/teams/${this.teamId}`);
    }
    /**
     * Detect framework from repository name (simple heuristic)
     */
    detectFramework(repo) {
        const repoLower = repo.toLowerCase();
        if (repoLower.includes('next') || repoLower.includes('nextjs'))
            return 'nextjs';
        if (repoLower.includes('react'))
            return 'create-react-app';
        if (repoLower.includes('vue'))
            return 'vue';
        if (repoLower.includes('nuxt'))
            return 'nuxtjs';
        if (repoLower.includes('svelte'))
            return 'svelte';
        if (repoLower.includes('gatsby'))
            return 'gatsby';
        if (repoLower.includes('angular'))
            return 'angular';
        return null;
    }
    /**
     * Generate unique deployment ID
     */
    generateDeploymentId() {
        return `dpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
     * Wait for deployment to complete
     */
    async waitForDeployment(deploymentId, timeout = 600000, // 10 minutes default
    pollInterval = 5000 // 5 seconds default
    ) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const deployment = await this.getDeployment(deploymentId);
            if (deployment.state === 'READY') {
                return deployment;
            }
            else if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
                throw new Error(`Deployment ${deploymentId} failed with state: ${deployment.state}`);
            }
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        throw new Error(`Deployment ${deploymentId} did not complete within ${timeout}ms`);
    }
}
exports.VercelAPI = VercelAPI;
