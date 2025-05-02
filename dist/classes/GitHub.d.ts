import GitHubAuthOptions from '../interfaces/GitHub/GitHubAuthOptions';
import { GitHubPaginationParams } from '../interfaces/GitHub/GitHubPaginationParams';
/**
 * Complete GitHub API wrapper for interacting with all GitHub endpoints
 */
export declare class GitHubAPI {
    private token;
    private baseUrl;
    /**
     * Create a new GitHub API client
     * @param options Authentication options
     */
    constructor(options: GitHubAuthOptions);
    /**
     * Make a request to the GitHub API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    private request;
    /**
     * Get authenticated user information
     */
    getAuthenticatedUser(): Promise<any>;
    /**
     * Get user by username
     * @param username GitHub username
     */
    getUser(username: string): Promise<any>;
    /**
     * Get user's repositories
     * @param username GitHub username
     * @param params Pagination parameters
     */
    getUserRepos(username: string, params?: GitHubPaginationParams & {
        type?: 'all' | 'owner' | 'member';
        sort?: 'created' | 'updated' | 'pushed' | 'full_name';
        direction?: 'asc' | 'desc';
    }): Promise<any>;
    /**
     * Get user's organizations
     * @param username GitHub username
     * @param params Pagination parameters
     */
    getUserOrgs(username: string, params?: GitHubPaginationParams): Promise<any>;
    /**
     * Get repository by owner and repo name
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     */
    getRepo(owner: string, repo: string): Promise<any>;
    /**
     * Create a new repository
     * @param data Repository creation data
     * @param org Optional organization name (if creating under an organization)
     */
    createRepo(data: {
        name: string;
        description?: string;
        homepage?: string;
        private?: boolean;
        has_issues?: boolean;
        has_projects?: boolean;
        has_wiki?: boolean;
        auto_init?: boolean;
        gitignore_template?: string;
        license_template?: string;
        allow_squash_merge?: boolean;
        allow_merge_commit?: boolean;
        allow_rebase_merge?: boolean;
        delete_branch_on_merge?: boolean;
    }, org?: string): Promise<any>;
    /**
     * Update a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Repository update data
     */
    updateRepo(owner: string, repo: string, data: {
        name?: string;
        description?: string;
        homepage?: string;
        private?: boolean;
        has_issues?: boolean;
        has_projects?: boolean;
        has_wiki?: boolean;
        default_branch?: string;
        allow_squash_merge?: boolean;
        allow_merge_commit?: boolean;
        allow_rebase_merge?: boolean;
        delete_branch_on_merge?: boolean;
    }): Promise<any>;
    /**
     * Delete a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     */
    deleteRepo(owner: string, repo: string): Promise<any>;
    /**
     * List repository branches
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Pagination parameters
     */
    getRepoBranches(owner: string, repo: string, params?: GitHubPaginationParams): Promise<any>;
    /**
     * Get branch details
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param branch Branch name
     */
    getBranch(owner: string, repo: string, branch: string): Promise<any>;
    /**
     * Get contents of a file or directory
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param path Path to the file or directory
     * @param ref Git reference (branch, tag, or commit SHA)
     */
    getContents(owner: string, repo: string, path: string, ref?: string): Promise<any>;
    /**
     * Create or update a file
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param path Path to the file
     * @param data File creation/update data
     */
    createOrUpdateFile(owner: string, repo: string, path: string, data: {
        message: string;
        content: string;
        sha?: string;
        branch?: string;
        committer?: {
            name: string;
            email: string;
        };
        author?: {
            name: string;
            email: string;
        };
    }): Promise<any>;
    /**
     * Delete a file
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param path Path to the file
     * @param data File deletion data
     */
    deleteFile(owner: string, repo: string, path: string, data: {
        message: string;
        sha: string;
        branch?: string;
        committer?: {
            name: string;
            email: string;
        };
        author?: {
            name: string;
            email: string;
        };
    }): Promise<any>;
    /**
     * List pull requests
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Query parameters
     */
    getPullRequests(owner: string, repo: string, params?: {
        state?: 'open' | 'closed' | 'all';
        head?: string;
        base?: string;
        sort?: 'created' | 'updated' | 'popularity' | 'long-running';
        direction?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<any>;
    /**
     * Get a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param pullNumber Pull request number
     */
    getPullRequest(owner: string, repo: string, pullNumber: number): Promise<any>;
    /**
     * Create a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Pull request creation data
     */
    createPullRequest(owner: string, repo: string, data: {
        title: string;
        head: string;
        base: string;
        body?: string;
        draft?: boolean;
        maintainer_can_modify?: boolean;
    }): Promise<any>;
    /**
     * Update a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param pullNumber Pull request number
     * @param data Pull request update data
     */
    updatePullRequest(owner: string, repo: string, pullNumber: number, data: {
        title?: string;
        body?: string;
        state?: 'open' | 'closed';
        base?: string;
        maintainer_can_modify?: boolean;
    }): Promise<any>;
    /**
     * Merge a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param pullNumber Pull request number
     * @param data Merge data
     */
    mergePullRequest(owner: string, repo: string, pullNumber: number, data?: {
        commit_title?: string;
        commit_message?: string;
        sha?: string;
        merge_method?: 'merge' | 'squash' | 'rebase';
    }): Promise<any>;
    /**
     * List issues
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Query parameters
     */
    getIssues(owner: string, repo: string, params?: {
        state?: 'open' | 'closed' | 'all';
        assignee?: string;
        creator?: string;
        mentioned?: string;
        labels?: string;
        sort?: 'created' | 'updated' | 'comments';
        direction?: 'asc' | 'desc';
        since?: string;
        per_page?: number;
        page?: number;
    }): Promise<any>;
    /**
     * Get an issue
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     */
    getIssue(owner: string, repo: string, issueNumber: number): Promise<any>;
    /**
     * Create an issue
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Issue creation data
     */
    createIssue(owner: string, repo: string, data: {
        title: string;
        body?: string;
        assignees?: string[];
        milestone?: number;
        labels?: string[];
        assignee?: string;
    }): Promise<any>;
    /**
     * Update an issue
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     * @param data Issue update data
     */
    updateIssue(owner: string, repo: string, issueNumber: number, data: {
        title?: string;
        body?: string;
        assignees?: string[];
        state?: 'open' | 'closed';
        milestone?: number;
        labels?: string[];
        assignee?: string;
    }): Promise<any>;
    /**
     * List issue comments
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     * @param params Pagination parameters
     */
    getIssueComments(owner: string, repo: string, issueNumber: number, params?: GitHubPaginationParams): Promise<any>;
    /**
     * Create an issue comment
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     * @param data Comment data
     */
    createIssueComment(owner: string, repo: string, issueNumber: number, data: {
        body: string;
    }): Promise<any>;
    /**
     * Update an issue comment
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param commentId Comment ID
     * @param data Comment update data
     */
    updateIssueComment(owner: string, repo: string, commentId: number, data: {
        body: string;
    }): Promise<any>;
    /**
     * Delete an issue comment
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param commentId Comment ID
     */
    deleteIssueComment(owner: string, repo: string, commentId: number): Promise<any>;
    /**
     * List commits
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Query parameters
     */
    getCommits(owner: string, repo: string, params?: {
        sha?: string;
        path?: string;
        author?: string;
        since?: string;
        until?: string;
        per_page?: number;
        page?: number;
    }): Promise<any>;
    /**
     * Get a commit
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param sha Commit SHA
     */
    getCommit(owner: string, repo: string, sha: string): Promise<any>;
    /**
     * Compare two commits
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param base Base commit
     * @param head Head commit
     */
    compareCommits(owner: string, repo: string, base: string, head: string): Promise<any>;
    /**
     * List releases
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Pagination parameters
     */
    getReleases(owner: string, repo: string, params?: GitHubPaginationParams): Promise<any>;
    /**
     * Get a release
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param releaseId Release ID
     */
    getRelease(owner: string, repo: string, releaseId: number): Promise<any>;
    /**
     * Create a release
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Release data
     */
    createRelease(owner: string, repo: string, data: {
        tag_name: string;
        target_commitish?: string;
        name?: string;
        body?: string;
        draft?: boolean;
        prerelease?: boolean;
    }): Promise<any>;
    /**
     * Clone a repository (fork it under your account)
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param options Fork options
     */
    forkRepo(owner: string, repo: string, options?: {
        organization?: string;
        name?: string;
    }): Promise<any>;
    /**
     * Get the latest release for a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     */
    getLatestRelease(owner: string, repo: string): Promise<any>;
    /**
     * Get the readme file for a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param ref Git reference (branch, tag, or commit SHA)
     */
    getReadme(owner: string, repo: string, ref?: string): Promise<any>;
    /**
     * Search repositories
     * @param query Search query
     * @param params Search parameters
     */
    searchRepositories(query: string, params?: {
        sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
        order?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<any>;
    /**
     * Search code
     * @param query Search query
     * @param params Search parameters
     */
    searchCode(query: string, params?: {
        sort?: 'indexed';
        order?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<any>;
    /**
     * Search issues and pull requests
     * @param query Search query
     * @param params Search parameters
     */
    searchIssues(query: string, params?: {
        sort?: 'comments' | 'reactions' | 'reactions-+1' | 'reactions--1' | 'reactions-smile' | 'reactions-thinking_face' | 'reactions-heart' | 'reactions-tada' | 'interactions' | 'created' | 'updated';
        order?: 'asc' | 'desc';
        per_page?: number;
        page?: number;
    }): Promise<any>;
}
