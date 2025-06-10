/// <reference types="node" />
/// <reference types="node" />
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
    devCommand?: string;
    latestDeployments: Deployment[];
    targets: Record<string, any>;
    lastRollbackTarget?: any;
    hasFloatingAliases: boolean;
    protectionBypass: Record<string, any>;
    passwordProtection?: any;
    ssoProtection?: any;
    gitLFS: boolean;
    webAnalytics?: any;
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
export declare class VercelAPI {
    private readonly accessToken;
    private readonly teamId?;
    private readonly baseUrl;
    constructor(config: VercelConfig);
    private request;
    private handleVercelError;
    /**
     * Create a new deployment
     */
    createDeployment(options: DeploymentOptions): Promise<Deployment>;
    /**
     * Get deployment by ID
     */
    getDeployment(deploymentId: string): Promise<Deployment>;
    /**
     * List deployments
     */
    listDeployments(options?: {
        app?: string;
        from?: number;
        limit?: number;
        since?: number;
        until?: number;
        state?: 'BUILDING' | 'ERROR' | 'INITIALIZING' | 'QUEUED' | 'READY' | 'CANCELED';
        target?: 'production' | 'staging';
    }): Promise<{
        deployments: Deployment[];
    }>;
    /**
     * Cancel a deployment
     */
    cancelDeployment(deploymentId: string): Promise<CancellationResponse>;
    /**
     * Get project by ID or name
     */
    getProject(projectIdOrName: string): Promise<Project>;
    /**
     * List projects
     */
    listProjects(options?: {
        from?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        projects: Project[];
    }>;
    /**
     * Create a new project
     */
    createProject(name: string, options?: {
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
    }): Promise<Project>;
    /**
     * Update project
     */
    updateProject(projectId: string, updates: {
        name?: string;
        buildCommand?: string;
        devCommand?: string;
        framework?: string;
        installCommand?: string;
        outputDirectory?: string;
        rootDirectory?: string;
        serverlessFunctionRegion?: string;
    }): Promise<Project>;
    /**
     * Delete project
     */
    deleteProject(projectId: string): Promise<void>;
    /**
     * Get environment variables for a project
     */
    getEnvironmentVariables(projectId: string): Promise<{
        envs: EnvironmentVariable[];
    }>;
    /**
     * Create environment variable
     */
    createEnvironmentVariable(projectId: string, key: string, value: string, target: ('production' | 'preview' | 'development')[]): Promise<EnvironmentVariable>;
    /**
     * Update environment variable
     */
    updateEnvironmentVariable(projectId: string, envId: string, updates: {
        key?: string;
        value?: string;
        target?: ('production' | 'preview' | 'development')[];
    }): Promise<EnvironmentVariable>;
    /**
     * Delete environment variable
     */
    deleteEnvironmentVariable(projectId: string, envId: string): Promise<void>;
    /**
     * Get domains for a project
     */
    getDomains(projectId: string): Promise<Domain[]>;
    /**
     * Add domain to project
     */
    addDomain(projectId: string, name: string, options?: {
        gitBranch?: string;
        redirect?: string;
        redirectStatusCode?: number;
    }): Promise<Domain>;
    /**
     * Remove domain from project
     */
    removeDomain(projectId: string, domain: string): Promise<void>;
    /**
     * Verify domain
     */
    verifyDomain(projectId: string, domain: string): Promise<Domain>;
    /**
     * Get deployment logs
     */
    getDeploymentLogs(deploymentId: string, options?: {
        direction?: 'forward' | 'backward';
        follow?: boolean;
        limit?: number;
        since?: number;
        until?: number;
    }): Promise<LogEntry[]>;
    /**
     * Get deployment files
     */
    getDeploymentFiles(deploymentId: string): Promise<any[]>;
    /**
     * Get current user/team information
     */
    getCurrentUser(): Promise<any>;
    /**
     * Get team information (if using team token)
     */
    getTeam(): Promise<any>;
    /**
     * Detect framework from repository name (simple heuristic)
     */
    private detectFramework;
    /**
     * Generate unique deployment ID
     */
    private generateDeploymentId;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
    /**
     * Wait for deployment to complete
     */
    waitForDeployment(deploymentId: string, timeout?: number, // 10 minutes default
    pollInterval?: number): Promise<Deployment>;
}
