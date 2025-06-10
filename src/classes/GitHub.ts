import axios from 'axios';
import GitHubAuthOptions from '../interfaces/GitHub/GitHubAuthOptions';
import { GitHubPaginationParams } from '../interfaces/GitHub/GitHubPaginationParams';
import { toPaginationParams } from '../utils/errorHandling';

/**
 * Complete GitHub API wrapper for interacting with all GitHub endpoints
 */
export class GitHubAPI {
  private token: string;
  private baseUrl: string = 'https://api.github.com';
  
  /**
   * Create a new GitHub API client
   * @param options Authentication options
   */
  constructor(options: GitHubAuthOptions) {
    this.token = options.token;
  }

  /**
   * Make a request to the GitHub API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param data Optional request body
   * @param params Optional query parameters
   */
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    data?: Record<string, unknown>,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await axios({
      method,
      url: `${this.baseUrl}${endpoint}`,
      data,
      params: toPaginationParams(params),
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
    return this.request<Record<string, unknown>>('get', '/user');
  }

  /**
   * Get user by username
   * @param username GitHub username
   */
  async getUser(username: string) {
    return this.request<Record<string, unknown>>('get', `/users/${username}`);
  }

  /**
   * Get user's repositories
   * @param username GitHub username
   * @param params Pagination parameters
   */
  async getUserRepos(username: string, params?: GitHubPaginationParams & {
    type?: 'all' | 'owner' | 'member';
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
  }) {
    return this.request<Record<string, unknown>>('get', `/users/${username}/repos`, undefined, toPaginationParams(params));
  }

  /**
   * Get user's organizations
   * @param username GitHub username
   * @param params Pagination parameters
   */
  async getUserOrgs(username: string, params?: GitHubPaginationParams) {
    return this.request<Record<string, unknown>>('get', `/users/${username}/orgs`, undefined, toPaginationParams(params));
  }

  // Repository endpoints

  /**
   * Get repository by owner and repo name
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   */
  async getRepo(owner: string, repo: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}`);
  }

  /**
   * Create a new repository
   * @param data Repository creation data
   * @param org Optional organization name (if creating under an organization)
   */
  async createRepo(data: {
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
  }, org?: string) {
    const endpoint = org ? `/orgs/${org}/repos` : '/user/repos';
    return this.request<Record<string, unknown>>('post', endpoint, data);
  }

  /**
   * Update a repository
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param data Repository update data
   */
  async updateRepo(owner: string, repo: string, data: {
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
  }) {
    return this.request<Record<string, unknown>>('patch', `/repos/${owner}/${repo}`, data);
  }

  /**
   * Delete a repository
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   */
  async deleteRepo(owner: string, repo: string) {
    return this.request<Record<string, unknown>>('delete', `/repos/${owner}/${repo}`);
  }

  /**
   * List repository branches
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param params Pagination parameters
   */
  async getRepoBranches(owner: string, repo: string, params?: GitHubPaginationParams) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/branches`, undefined, toPaginationParams(params));
  }

  /**
   * Get branch details
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param branch Branch name
   */
  async getBranch(owner: string, repo: string, branch: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/branches/${branch}`);
  }

  // Content endpoints

  /**
   * Get contents of a file or directory
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param path Path to the file or directory
   * @param ref Git reference (branch, tag, or commit SHA)
   */
  async getContents(owner: string, repo: string, path: string, ref?: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/contents/${path}`, undefined, { ref });
  }

  /**
   * Create or update a file
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param path Path to the file
   * @param data File creation/update data
   */
  async createOrUpdateFile(owner: string, repo: string, path: string, data: {
    message: string;
    content: string; // Base64-encoded content
    sha?: string; // Required for updating a file
    branch?: string;
    committer?: {
      name: string;
      email: string;
    };
    author?: {
      name: string;
      email: string;
    };
  }) {
    return this.request<Record<string, unknown>>('put', `/repos/${owner}/${repo}/contents/${path}`, data);
  }

  /**
   * Delete a file
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param path Path to the file
   * @param data File deletion data
   */
  async deleteFile(owner: string, repo: string, path: string, data: {
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
  }) {
    return this.request<Record<string, unknown>>('delete', `/repos/${owner}/${repo}/contents/${path}`, data);
  }

  // Pull Request endpoints

  /**
   * List pull requests
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param params Query parameters
   */
  async getPullRequests(owner: string, repo: string, params?: {
    state?: 'open' | 'closed' | 'all';
    head?: string;
    base?: string;
    sort?: 'created' | 'updated' | 'popularity' | 'long-running';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/pulls`, undefined, toPaginationParams(params));
  }

  /**
   * Get a pull request
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param pullNumber Pull request number
   */
  async getPullRequest(owner: string, repo: string, pullNumber: number) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/pulls/${pullNumber}`);
  }

  /**
   * Create a pull request
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param data Pull request creation data
   */
  async createPullRequest(owner: string, repo: string, data: {
    title: string;
    head: string; // The name of the branch where your changes are implemented
    base: string; // The name of the branch you want the changes pulled into
    body?: string;
    draft?: boolean;
    maintainer_can_modify?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', `/repos/${owner}/${repo}/pulls`, data);
  }

  /**
   * Update a pull request
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param pullNumber Pull request number
   * @param data Pull request update data
   */
  async updatePullRequest(owner: string, repo: string, pullNumber: number, data: {
    title?: string;
    body?: string;
    state?: 'open' | 'closed';
    base?: string;
    maintainer_can_modify?: boolean;
  }) {
    return this.request<Record<string, unknown>>('patch', `/repos/${owner}/${repo}/pulls/${pullNumber}`, data);
  }

  /**
   * Merge a pull request
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param pullNumber Pull request number
   * @param data Merge data
   */
  async mergePullRequest(owner: string, repo: string, pullNumber: number, data?: {
    commit_title?: string;
    commit_message?: string;
    sha?: string;
    merge_method?: 'merge' | 'squash' | 'rebase';
  }) {
    return this.request<Record<string, unknown>>('put', `/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, data);
  }

  // Issues endpoints

  /**
   * List issues
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param params Query parameters
   */
  async getIssues(owner: string, repo: string, params?: {
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
  }) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/issues`, undefined, toPaginationParams(params));
  }

  /**
   * Get an issue
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param issueNumber Issue number
   */
  async getIssue(owner: string, repo: string, issueNumber: number) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  /**
   * Create an issue
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param data Issue creation data
   */
  async createIssue(owner: string, repo: string, data: {
    title: string;
    body?: string;
    assignees?: string[];
    milestone?: number;
    labels?: string[];
    assignee?: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/repos/${owner}/${repo}/issues`, data);
  }

  /**
   * Update an issue
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param issueNumber Issue number
   * @param data Issue update data
   */
  async updateIssue(owner: string, repo: string, issueNumber: number, data: {
    title?: string;
    body?: string;
    assignees?: string[];
    state?: 'open' | 'closed';
    milestone?: number;
    labels?: string[];
    assignee?: string;
  }) {
    return this.request<Record<string, unknown>>('patch', `/repos/${owner}/${repo}/issues/${issueNumber}`, data);
  }

  // Comments endpoints

  /**
   * List issue comments
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param issueNumber Issue number
   * @param params Pagination parameters
   */
  async getIssueComments(owner: string, repo: string, issueNumber: number, params?: GitHubPaginationParams) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, undefined, toPaginationParams(params));
  }

  /**
   * Create an issue comment
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param issueNumber Issue number
   * @param data Comment data
   */
  async createIssueComment(owner: string, repo: string, issueNumber: number, data: {
    body: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/repos/${owner}/${repo}/issues/${issueNumber}/comments`, data);
  }

  /**
   * Update an issue comment
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param commentId Comment ID
   * @param data Comment update data
   */
  async updateIssueComment(owner: string, repo: string, commentId: number, data: {
    body: string;
  }) {
    return this.request<Record<string, unknown>>('patch', `/repos/${owner}/${repo}/issues/comments/${commentId}`, data);
  }

  /**
   * Delete an issue comment
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param commentId Comment ID
   */
  async deleteIssueComment(owner: string, repo: string, commentId: number) {
    return this.request<Record<string, unknown>>('delete', `/repos/${owner}/${repo}/issues/comments/${commentId}`);
  }

  // Commits and events endpoints

  /**
   * List commits
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param params Query parameters
   */
  async getCommits(owner: string, repo: string, params?: {
    sha?: string;
    path?: string;
    author?: string;
    since?: string;
    until?: string;
    per_page?: number;
    page?: number;
  }) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/commits`, undefined, toPaginationParams(params));
  }

  /**
   * Get a commit
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param sha Commit SHA
   */
  async getCommit(owner: string, repo: string, sha: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/commits/${sha}`);
  }

  /**
   * Compare two commits
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param base Base commit
   * @param head Head commit
   */
  async compareCommits(owner: string, repo: string, base: string, head: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/compare/${base}...${head}`);
  }

  // Releases endpoints

  /**
   * List releases
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param params Pagination parameters
   */
  async getReleases(owner: string, repo: string, params?: GitHubPaginationParams) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/releases`, undefined, toPaginationParams(params));
  }

  /**
   * Get a release
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param releaseId Release ID
   */
  async getRelease(owner: string, repo: string, releaseId: number) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/releases/${releaseId}`);
  }

  /**
   * Create a release
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param data Release data
   */
  async createRelease(owner: string, repo: string, data: {
    tag_name: string;
    target_commitish?: string;
    name?: string;
    body?: string;
    draft?: boolean;
    prerelease?: boolean;
  }) {
    return this.request<Record<string, unknown>>('post', `/repos/${owner}/${repo}/releases`, data);
  }

  // Helper methods for common tasks

  /**
   * Clone a repository (fork it under your account)
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param options Fork options
   */
  async forkRepo(owner: string, repo: string, options?: {
    organization?: string;
    name?: string;
  }) {
    return this.request<Record<string, unknown>>('post', `/repos/${owner}/${repo}/forks`, options);
  }

  /**
   * Get the latest release for a repository
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   */
  async getLatestRelease(owner: string, repo: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/releases/latest`);
  }

  /**
   * Get the readme file for a repository
   * @param owner Repository owner (user or organization)
   * @param repo Repository name
   * @param ref Git reference (branch, tag, or commit SHA)
   */
  async getReadme(owner: string, repo: string, ref?: string) {
    return this.request<Record<string, unknown>>('get', `/repos/${owner}/${repo}/readme`, undefined, { ref });
  }

  /**
   * Search repositories
   * @param query Search query
   * @param params Search parameters
   */
  async searchRepositories(query: string, params?: {
    sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/search/repositories', undefined, { 
      q: query,
      ...toPaginationParams(params)
    });
  }

  /**
   * Search code
   * @param query Search query
   * @param params Search parameters
   */
  async searchCode(query: string, params?: {
    sort?: 'indexed';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/search/code', undefined, { 
      q: query,
      ...toPaginationParams(params)
    });
  }

  /**
   * Search issues and pull requests
   * @param query Search query
   * @param params Search parameters
   */
  async searchIssues(query: string, params?: {
    sort?: 'comments' | 'reactions' | 'reactions-+1' | 'reactions--1' | 'reactions-smile' | 'reactions-thinking_face' | 'reactions-heart' | 'reactions-tada' | 'interactions' | 'created' | 'updated';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/search/issues', undefined, { 
      q: query,
      ...toPaginationParams(params)
    });
  }
}