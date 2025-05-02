"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Complete GitHub API wrapper for interacting with all GitHub endpoints
 */
class GitHubAPI {
    /**
     * Create a new GitHub API client
     * @param options Authentication options
     */
    constructor(options) {
        this.baseUrl = 'https://api.github.com';
        this.token = options.token;
    }
    /**
     * Make a request to the GitHub API
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
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    }
    // User endpoints
    /**
     * Get authenticated user information
     */
    async getAuthenticatedUser() {
        return this.request('get', '/user');
    }
    /**
     * Get user by username
     * @param username GitHub username
     */
    async getUser(username) {
        return this.request('get', `/users/${username}`);
    }
    /**
     * Get user's repositories
     * @param username GitHub username
     * @param params Pagination parameters
     */
    async getUserRepos(username, params) {
        return this.request('get', `/users/${username}/repos`, undefined, params);
    }
    /**
     * Get user's organizations
     * @param username GitHub username
     * @param params Pagination parameters
     */
    async getUserOrgs(username, params) {
        return this.request('get', `/users/${username}/orgs`, undefined, params);
    }
    // Repository endpoints
    /**
     * Get repository by owner and repo name
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     */
    async getRepo(owner, repo) {
        return this.request('get', `/repos/${owner}/${repo}`);
    }
    /**
     * Create a new repository
     * @param data Repository creation data
     * @param org Optional organization name (if creating under an organization)
     */
    async createRepo(data, org) {
        const endpoint = org ? `/orgs/${org}/repos` : '/user/repos';
        return this.request('post', endpoint, data);
    }
    /**
     * Update a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Repository update data
     */
    async updateRepo(owner, repo, data) {
        return this.request('patch', `/repos/${owner}/${repo}`, data);
    }
    /**
     * Delete a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     */
    async deleteRepo(owner, repo) {
        return this.request('delete', `/repos/${owner}/${repo}`);
    }
    /**
     * List repository branches
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Pagination parameters
     */
    async getRepoBranches(owner, repo, params) {
        return this.request('get', `/repos/${owner}/${repo}/branches`, undefined, params);
    }
    /**
     * Get branch details
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param branch Branch name
     */
    async getBranch(owner, repo, branch) {
        return this.request('get', `/repos/${owner}/${repo}/branches/${branch}`);
    }
    // Content endpoints
    /**
     * Get contents of a file or directory
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param path Path to the file or directory
     * @param ref Git reference (branch, tag, or commit SHA)
     */
    async getContents(owner, repo, path, ref) {
        return this.request('get', `/repos/${owner}/${repo}/contents/${path}`, undefined, { ref });
    }
    /**
     * Create or update a file
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param path Path to the file
     * @param data File creation/update data
     */
    async createOrUpdateFile(owner, repo, path, data) {
        return this.request('put', `/repos/${owner}/${repo}/contents/${path}`, data);
    }
    /**
     * Delete a file
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param path Path to the file
     * @param data File deletion data
     */
    async deleteFile(owner, repo, path, data) {
        return this.request('delete', `/repos/${owner}/${repo}/contents/${path}`, data);
    }
    // Pull Request endpoints
    /**
     * List pull requests
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Query parameters
     */
    async getPullRequests(owner, repo, params) {
        return this.request('get', `/repos/${owner}/${repo}/pulls`, undefined, params);
    }
    /**
     * Get a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param pullNumber Pull request number
     */
    async getPullRequest(owner, repo, pullNumber) {
        return this.request('get', `/repos/${owner}/${repo}/pulls/${pullNumber}`);
    }
    /**
     * Create a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Pull request creation data
     */
    async createPullRequest(owner, repo, data) {
        return this.request('post', `/repos/${owner}/${repo}/pulls`, data);
    }
    /**
     * Update a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param pullNumber Pull request number
     * @param data Pull request update data
     */
    async updatePullRequest(owner, repo, pullNumber, data) {
        return this.request('patch', `/repos/${owner}/${repo}/pulls/${pullNumber}`, data);
    }
    /**
     * Merge a pull request
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param pullNumber Pull request number
     * @param data Merge data
     */
    async mergePullRequest(owner, repo, pullNumber, data) {
        return this.request('put', `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, data);
    }
    // Issues endpoints
    /**
     * List issues
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Query parameters
     */
    async getIssues(owner, repo, params) {
        return this.request('get', `/repos/${owner}/${repo}/issues`, undefined, params);
    }
    /**
     * Get an issue
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     */
    async getIssue(owner, repo, issueNumber) {
        return this.request('get', `/repos/${owner}/${repo}/issues/${issueNumber}`);
    }
    /**
     * Create an issue
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Issue creation data
     */
    async createIssue(owner, repo, data) {
        return this.request('post', `/repos/${owner}/${repo}/issues`, data);
    }
    /**
     * Update an issue
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     * @param data Issue update data
     */
    async updateIssue(owner, repo, issueNumber, data) {
        return this.request('patch', `/repos/${owner}/${repo}/issues/${issueNumber}`, data);
    }
    // Comments endpoints
    /**
     * List issue comments
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     * @param params Pagination parameters
     */
    async getIssueComments(owner, repo, issueNumber, params) {
        return this.request('get', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, undefined, params);
    }
    /**
     * Create an issue comment
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param issueNumber Issue number
     * @param data Comment data
     */
    async createIssueComment(owner, repo, issueNumber, data) {
        return this.request('post', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, data);
    }
    /**
     * Update an issue comment
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param commentId Comment ID
     * @param data Comment update data
     */
    async updateIssueComment(owner, repo, commentId, data) {
        return this.request('patch', `/repos/${owner}/${repo}/issues/comments/${commentId}`, data);
    }
    /**
     * Delete an issue comment
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param commentId Comment ID
     */
    async deleteIssueComment(owner, repo, commentId) {
        return this.request('delete', `/repos/${owner}/${repo}/issues/comments/${commentId}`);
    }
    // Commits and events endpoints
    /**
     * List commits
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Query parameters
     */
    async getCommits(owner, repo, params) {
        return this.request('get', `/repos/${owner}/${repo}/commits`, undefined, params);
    }
    /**
     * Get a commit
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param sha Commit SHA
     */
    async getCommit(owner, repo, sha) {
        return this.request('get', `/repos/${owner}/${repo}/commits/${sha}`);
    }
    /**
     * Compare two commits
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param base Base commit
     * @param head Head commit
     */
    async compareCommits(owner, repo, base, head) {
        return this.request('get', `/repos/${owner}/${repo}/compare/${base}...${head}`);
    }
    // Releases endpoints
    /**
     * List releases
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param params Pagination parameters
     */
    async getReleases(owner, repo, params) {
        return this.request('get', `/repos/${owner}/${repo}/releases`, undefined, params);
    }
    /**
     * Get a release
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param releaseId Release ID
     */
    async getRelease(owner, repo, releaseId) {
        return this.request('get', `/repos/${owner}/${repo}/releases/${releaseId}`);
    }
    /**
     * Create a release
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param data Release data
     */
    async createRelease(owner, repo, data) {
        return this.request('post', `/repos/${owner}/${repo}/releases`, data);
    }
    // Helper methods for common tasks
    /**
     * Clone a repository (fork it under your account)
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param options Fork options
     */
    async forkRepo(owner, repo, options) {
        return this.request('post', `/repos/${owner}/${repo}/forks`, options);
    }
    /**
     * Get the latest release for a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     */
    async getLatestRelease(owner, repo) {
        return this.request('get', `/repos/${owner}/${repo}/releases/latest`);
    }
    /**
     * Get the readme file for a repository
     * @param owner Repository owner (user or organization)
     * @param repo Repository name
     * @param ref Git reference (branch, tag, or commit SHA)
     */
    async getReadme(owner, repo, ref) {
        return this.request('get', `/repos/${owner}/${repo}/readme`, undefined, { ref });
    }
    /**
     * Search repositories
     * @param query Search query
     * @param params Search parameters
     */
    async searchRepositories(query, params) {
        return this.request('get', '/search/repositories', undefined, {
            q: query,
            ...params
        });
    }
    /**
     * Search code
     * @param query Search query
     * @param params Search parameters
     */
    async searchCode(query, params) {
        return this.request('get', '/search/code', undefined, {
            q: query,
            ...params
        });
    }
    /**
     * Search issues and pull requests
     * @param query Search query
     * @param params Search parameters
     */
    async searchIssues(query, params) {
        return this.request('get', '/search/issues', undefined, {
            q: query,
            ...params
        });
    }
}
exports.GitHubAPI = GitHubAPI;
