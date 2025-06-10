import axios, { AxiosResponse } from 'axios';

export interface VercelConfig {
  accessToken: string;
  teamId?: string;
}

export interface DeploymentOptions {
  name?: string;
  files?: File[];
  gitSource?: GitSource;
  env?: Record<string, string>;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  devCommand?: string;
  regions?: string[];
  functions?: Record<string, FunctionConfiguration>;
  routes?: Route[];
  cleanUrls?: boolean;
  trailingSlash?: boolean;
  redirects?: Redirect[];
  headers?: Header[];
  rewrites?: Rewrite[];
}

export interface GitSource {
  type: 'github' | 'gitlab' | 'bitbucket';
  repo: string;
  ref?: string;
  sha?: string;
}

export interface File {
  file: string;
  data: string | Buffer;
  encoding?: 'utf8' | 'base64';
}

export interface FunctionConfiguration {
  runtime?: string;
  memory?: number;
  maxDuration?: number;
  regions?: string[];
}

export interface Route {
  src: string;
  dest?: string;
  headers?: Record<string, string>;
  methods?: string[];
  status?: number;
  continue?: boolean;
}

export interface Redirect {
  source: string;
  destination: string;
  permanent?: boolean;
}

export interface Header {
  source: string;
  headers: Array<{
    key: string;
    value: string;
  }>;
}

export interface Rewrite {
  source: string;
  destination: string;
}

export interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
  type: 'LAMBDAS';
  createdAt: number;
  buildingAt?: number;
  readyAt?: number;
  creator: {
    uid: string;
    username: string;
    email: string;
  };
  inspectorUrl?: string;
  meta?: Record<string, any>;
  target?: 'production' | 'staging';
  aliasAssigned?: boolean;
  aliasError?: any;
  aliasFinal?: string;
  checksState?: 'registered' | 'running' | 'completed';
  checksConclusion?: 'succeeded' | 'failed' | 'skipped' | 'canceled';
  readyState: 'READY' | 'ERROR';
  buildErrorAt?: number;
  canceledAt?: number;
  regions: string[];
  functions?: Record<string, FunctionConfiguration>;
  plan: 'hobby' | 'pro' | 'enterprise';
  public: boolean;
  ownerId: string;
  projectId: string;
  status: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'INITIALIZING' | 'CANCELED';
}

export interface Project {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  env: EnvironmentVariable[];
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  devCommand?: string;
  framework?: string;
  nodeVersion: string;
  regions: string[];
  analytics?: {
    id: string;
    canceledAt?: number;
    disabledAt?: number;
    enabledAt: number;
    paidAt?: number;
    sampleRatePercent?: number;
    spendLimitInDollars?: number;
  };
  speedInsights?: {
    id: string;
    hasData: boolean;
  };
  webAnalytics?: {
    id: string;
  };
  autoExposeSystemEnvs: boolean;
  gitForkProtection: boolean;
  priorityHint?: number;
  latestDeployments: Deployment[];
  targets: Record<string, any>;
  lastRollbackTarget?: any;
  hasFloatingAliases: boolean;
  protectionBypass: Record<string, any>;
  passwordProtection?: any;
  ssoProtection?: any;
  gitLFS: boolean;
  crons?: {
    enabledAt: number;
    disabledAt?: number;
    updatedAt: number;
    deploymentId?: string;
    definitions: CronJob[];
  };
}

export interface EnvironmentVariable {
  type: 'system' | 'secret' | 'encrypted' | 'plain';
  id?: string;
  key: string;
  value: string;
  target: ('production' | 'preview' | 'development')[];
  gitBranch?: string;
  configurationId?: string;
  updatedAt?: number;
  createdAt?: number;
}

export interface CronJob {
  path: string;
  schedule: string;
}

export interface Domain {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string;
  redirectStatusCode?: number;
  gitBranch?: string;
  updatedAt: number;
  createdAt: number;
  verified: boolean;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  source: 'build' | 'lambda' | 'edge' | 'external' | 'static';
  level?: 'info' | 'warn' | 'error';
  requestId?: string;
  statusCode?: number;
  proxy?: {
    timestamp: number;
    method: string;
    scheme: string;
    host: string;
    path: string;
    userAgent: string;
    referer: string;
    statusCode: number;
    clientIp: string;
    region: string;
  };
}

export interface CancellationResponse {
  state: 'CANCELED';
  uid: string;
}

/**
 * Production-ready Vercel API wrapper for deployment automation & project management
 */
export class VercelAPI {
  private readonly accessToken: string;
  private readonly teamId?: string;
  private readonly baseUrl = 'https://api.vercel.com';

  constructor(config: VercelConfig) {
    if (!config.accessToken) {
      throw new Error('Vercel access token is required');
    }
    
    this.accessToken = config.accessToken;
    this.teamId = config.teamId;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
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

      const response: AxiosResponse<T> = await axios({
        method,
        url: url.toString(),
        data,
        headers,
        timeout: 60000 // Longer timeout for deployment operations
      });

      return response.data;
    } catch (error: any) {
      this.handleVercelError(error);
      throw error;
    }
  }

  private handleVercelError(error: any): void {
    if (error.response?.data?.error) {
      const vercelError = error.response.data.error;
      throw new Error(`Vercel API Error: ${vercelError.message || vercelError.code || 'Unknown error'}`);
    }
  }

  /**
   * Create a new deployment
   */
  async createDeployment(options: DeploymentOptions): Promise<Deployment> {
    if (!options.name && !options.gitSource) {
      throw new Error('Either deployment name or git source is required');
    }

    const deploymentData: any = {
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

    if (options.buildCommand) deploymentData.buildCommand = options.buildCommand;
    if (options.outputDirectory) deploymentData.outputDirectory = options.outputDirectory;
    if (options.installCommand) deploymentData.installCommand = options.installCommand;
    if (options.devCommand) deploymentData.devCommand = options.devCommand;
    if (options.regions) deploymentData.regions = options.regions;
    if (options.functions) deploymentData.functions = options.functions;
    if (options.routes) deploymentData.routes = options.routes;
    if (options.cleanUrls !== undefined) deploymentData.cleanUrls = options.cleanUrls;
    if (options.trailingSlash !== undefined) deploymentData.trailingSlash = options.trailingSlash;
    if (options.redirects) deploymentData.redirects = options.redirects;
    if (options.headers) deploymentData.headers = options.headers;
    if (options.rewrites) deploymentData.rewrites = options.rewrites;

    // Set target to production by default
    deploymentData.target = 'production';
    deploymentData.projectSettings = {
      framework: options.gitSource ? this.detectFramework(options.gitSource.repo) : null
    };

    return this.request<Deployment>('POST', '/v13/deployments', deploymentData);
  }

  /**
   * Get deployment by ID
   */
  async getDeployment(deploymentId: string): Promise<Deployment> {
    return this.request<Deployment>('GET', `/v13/deployments/${deploymentId}`);
  }

  /**
   * List deployments
   */
  async listDeployments(options?: {
    app?: string;
    from?: number;
    limit?: number;
    since?: number;
    until?: number;
    state?: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
    target?: 'production' | 'staging';
  }): Promise<{ deployments: Deployment[] }> {
    const params: any = {};
    
    if (options?.app) params.app = options.app;
    if (options?.from) params.from = options.from;
    if (options?.limit) params.limit = options.limit;
    if (options?.since) params.since = options.since;
    if (options?.until) params.until = options.until;
    if (options?.state) params.state = options.state;
    if (options?.target) params.target = options.target;

    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/v6/deployments?${queryString}` : '/v6/deployments';
    
    return this.request<{ deployments: Deployment[] }>('GET', endpoint);
  }

  /**
   * Cancel a deployment
   */
  async cancelDeployment(deploymentId: string): Promise<CancellationResponse> {
    return this.request<CancellationResponse>('PATCH', `/v12/deployments/${deploymentId}/cancel`);
  }

  /**
   * Get project by ID or name
   */
  async getProject(projectIdOrName: string): Promise<Project> {
    return this.request<Project>('GET', `/v9/projects/${encodeURIComponent(projectIdOrName)}`);
  }

  /**
   * List projects
   */
  async listProjects(options?: {
    from?: number;
    limit?: number;
    search?: string;
  }): Promise<{ projects: Project[] }> {
    const params: any = {};
    
    if (options?.from) params.from = options.from;
    if (options?.limit) params.limit = options.limit;
    if (options?.search) params.search = options.search;

    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/v9/projects?${queryString}` : '/v9/projects';
    
    return this.request<{ projects: Project[] }>('GET', endpoint);
  }

  /**
   * Create a new project
   */
  async createProject(name: string, options?: {
    buildCommand?: string;
    devCommand?: string;
    framework?: string;
    installCommand?: string;
    outputDirectory?: string;
    publicSource?: boolean;
    rootDirectory?: string;
    serverlessFunctionRegion?: string;
    skipGitConnectDuringLink?: boolean;
    gitRepository?: {
      repo: string;
      type: 'github' | 'gitlab' | 'bitbucket';
    };
  }): Promise<Project> {
    const projectData: any = { name };
    
    if (options) {
      Object.assign(projectData, options);
    }

    return this.request<Project>('POST', '/v9/projects', projectData);
  }

  /**
   * Update project
   */
  async updateProject(projectId: string, updates: {
    name?: string;
    buildCommand?: string;
    devCommand?: string;
    framework?: string;
    installCommand?: string;
    outputDirectory?: string;
    rootDirectory?: string;
    serverlessFunctionRegion?: string;
  }): Promise<Project> {
    return this.request<Project>('PATCH', `/v9/projects/${projectId}`, updates);
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.request('DELETE', `/v9/projects/${projectId}`);
  }

  /**
   * Get environment variables for a project
   */
  async getEnvironmentVariables(projectId: string): Promise<{ envs: EnvironmentVariable[] }> {
    return this.request<{ envs: EnvironmentVariable[] }>('GET', `/v9/projects/${projectId}/env`);
  }

  /**
   * Create environment variable
   */
  async createEnvironmentVariable(
    projectId: string, 
    key: string, 
    value: string, 
    target: ('production' | 'preview' | 'development')[]
  ): Promise<EnvironmentVariable> {
    const envData = {
      key,
      value,
      target,
      type: 'encrypted' as const
    };

    return this.request<EnvironmentVariable>('POST', `/v9/projects/${projectId}/env`, envData);
  }

  /**
   * Update environment variable
   */
  async updateEnvironmentVariable(
    projectId: string,
    envId: string,
    updates: {
      key?: string;
      value?: string;
      target?: ('production' | 'preview' | 'development')[];
    }
  ): Promise<EnvironmentVariable> {
    return this.request<EnvironmentVariable>('PATCH', `/v9/projects/${projectId}/env/${envId}`, updates);
  }

  /**
   * Delete environment variable
   */
  async deleteEnvironmentVariable(projectId: string, envId: string): Promise<void> {
    await this.request('DELETE', `/v9/projects/${projectId}/env/${envId}`);
  }

  /**
   * Get domains for a project
   */
  async getDomains(projectId: string): Promise<Domain[]> {
    const response = await this.request<{ domains: Domain[] }>('GET', `/v9/projects/${projectId}/domains`);
    return response.domains;
  }

  /**
   * Add domain to project
   */
  async addDomain(projectId: string, name: string, options?: {
    gitBranch?: string;
    redirect?: string;
    redirectStatusCode?: number;
  }): Promise<Domain> {
    const domainData: any = { name };
    
    if (options) {
      Object.assign(domainData, options);
    }

    return this.request<Domain>('POST', `/v9/projects/${projectId}/domains`, domainData);
  }

  /**
   * Remove domain from project
   */
  async removeDomain(projectId: string, domain: string): Promise<void> {
    await this.request('DELETE', `/v9/projects/${projectId}/domains/${domain}`);
  }

  /**
   * Verify domain
   */
  async verifyDomain(projectId: string, domain: string): Promise<Domain> {
    return this.request<Domain>('POST', `/v9/projects/${projectId}/domains/${domain}/verify`);
  }

  /**
   * Get deployment logs
   */
  async getDeploymentLogs(deploymentId: string, options?: {
    direction?: 'forward' | 'backward';
    follow?: boolean;
    limit?: number;
    since?: number;
    until?: number;
  }): Promise<LogEntry[]> {
    const params: any = {};
    
    if (options?.direction) params.direction = options.direction;
    if (options?.follow !== undefined) params.follow = options.follow;
    if (options?.limit) params.limit = options.limit;
    if (options?.since) params.since = options.since;
    if (options?.until) params.until = options.until;

    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString 
      ? `/v2/deployments/${deploymentId}/events?${queryString}`
      : `/v2/deployments/${deploymentId}/events`;
    
    return this.request<LogEntry[]>('GET', endpoint);
  }

  /**
   * Get deployment files
   */
  async getDeploymentFiles(deploymentId: string): Promise<any[]> {
    const response = await this.request<{ files: any[] }>('GET', `/v6/deployments/${deploymentId}/files`);
    return response.files;
  }

  /**
   * Get current user/team information
   */
  async getCurrentUser(): Promise<any> {
    return this.request<any>('GET', '/v2/user');
  }

  /**
   * Get team information (if using team token)
   */
  async getTeam(): Promise<any> {
    if (!this.teamId) {
      throw new Error('Team ID is required for team operations');
    }
    return this.request<any>('GET', `/v2/teams/${this.teamId}`);
  }

  /**
   * Detect framework from repository name (simple heuristic)
   */
  private detectFramework(repo: string): string | null {
    const repoLower = repo.toLowerCase();
    
    if (repoLower.includes('next') || repoLower.includes('nextjs')) return 'nextjs';
    if (repoLower.includes('react')) return 'create-react-app';
    if (repoLower.includes('vue')) return 'vue';
    if (repoLower.includes('nuxt')) return 'nuxtjs';
    if (repoLower.includes('svelte')) return 'svelte';
    if (repoLower.includes('gatsby')) return 'gatsby';
    if (repoLower.includes('angular')) return 'angular';
    
    return null;
  }

  /**
   * Generate unique deployment ID
   */
  private generateDeploymentId(): string {
    return `dpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for deployment to complete
   */
  async waitForDeployment(
    deploymentId: string, 
    timeout: number = 600000, // 10 minutes default
    pollInterval: number = 5000 // 5 seconds default
  ): Promise<Deployment> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const deployment = await this.getDeployment(deploymentId);
      
      if (deployment.state === 'READY') {
        return deployment;
      } else if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
        throw new Error(`Deployment ${deploymentId} failed with state: ${deployment.state}`);
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Deployment ${deploymentId} did not complete within ${timeout}ms`);
  }
}