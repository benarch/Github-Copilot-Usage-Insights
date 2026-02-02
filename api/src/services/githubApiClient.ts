/**
 * GitHub API Client for fetching Copilot Metrics
 * 
 * This service handles authentication and data fetching from GitHub's Copilot Metrics API.
 * 
 * API Reference: https://docs.github.com/en/rest/copilot/copilot-usage
 */

// Constants
const GITHUB_API_VERSION = '2022-11-28';

export interface CopilotUsageMetrics {
  day: string;
  total_suggestions_count: number;
  total_acceptances_count: number;
  total_lines_suggested: number;
  total_lines_accepted: number;
  total_active_users: number;
  total_chat_acceptances: number;
  total_chat_turns: number;
  total_active_chat_users: number;
  breakdown: Array<{
    language?: string;
    editor?: string;
    suggestions_count: number;
    acceptances_count: number;
    lines_suggested: number;
    lines_accepted: number;
    active_users: number;
  }>;
}

export interface GitHubApiConfig {
  token: string;
  organization: string;
  baseUrl?: string;
}

export class GitHubApiClient {
  private token: string;
  private organization: string;
  private baseUrl: string;

  constructor(config: GitHubApiConfig) {
    this.token = config.token;
    this.organization = config.organization;
    this.baseUrl = config.baseUrl || 'https://api.github.com';
  }

  /**
   * Fetch Copilot usage metrics for the organization
   * @param since Optional ISO 8601 timestamp to fetch data from
   * @param until Optional ISO 8601 timestamp to fetch data until
   * @param page Page number for pagination (default: 1)
   * @param perPage Items per page (default: 28, max: 28)
   */
  async fetchCopilotUsageMetrics(
    since?: string,
    until?: string,
    page: number = 1,
    perPage: number = 28
  ): Promise<CopilotUsageMetrics[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: Math.min(perPage, 28).toString(),
    });

    if (since) {
      params.append('since', since);
    }
    if (until) {
      params.append('until', until);
    }

    const url = `${this.baseUrl}/orgs/${this.organization}/copilot/usage?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.token}`,
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `GitHub API request failed: ${response.status} ${response.statusText}. ${errorBody}`
        );
      }

      const data = await response.json();
      return data as CopilotUsageMetrics[];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Copilot metrics: ${error.message}`);
      }
      throw new Error('Failed to fetch Copilot metrics: Unknown error');
    }
  }

  /**
   * Fetch all available Copilot usage metrics with pagination
   * @param since Optional ISO 8601 timestamp to fetch data from
   * @param until Optional ISO 8601 timestamp to fetch data until
   */
  async fetchAllCopilotUsageMetrics(
    since?: string,
    until?: string
  ): Promise<CopilotUsageMetrics[]> {
    const allMetrics: CopilotUsageMetrics[] = [];
    let page = 1;
    const perPage = 28;
    let hasMoreData = true;

    while (hasMoreData) {
      const metrics = await this.fetchCopilotUsageMetrics(since, until, page, perPage);
      
      if (metrics.length === 0) {
        hasMoreData = false;
      } else {
        allMetrics.push(...metrics);
        
        // If we got fewer results than perPage, we've reached the end
        if (metrics.length < perPage) {
          hasMoreData = false;
        } else {
          page++;
        }
      }
    }

    return allMetrics;
  }

  /**
   * Test the API connection and token validity
   */
  async testConnection(): Promise<boolean> {
    const url = `${this.baseUrl}/orgs/${this.organization}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.token}`,
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get rate limit information
   */
  async getRateLimit(): Promise<{
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  }> {
    const url = `${this.baseUrl}/rate_limit`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${this.token}`,
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rate limit: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.rate;
    } catch (error) {
      throw new Error(`Failed to get rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Create a GitHub API client from environment variables
 */
export function createGitHubApiClient(): GitHubApiClient | null {
  const token = process.env.GITHUB_TOKEN;
  const organization = process.env.GITHUB_ORG;

  if (!token || !organization) {
    return null;
  }

  return new GitHubApiClient({
    token,
    organization,
  });
}
