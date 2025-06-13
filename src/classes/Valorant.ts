import axios from 'axios';
import ValorantAccount from '../interfaces/Valorant/ValorantAccount';
import ValorantLeaderboardOptions from '../interfaces/Valorant/ValorantLeaderboardOptions';
import ValorantMMROptions from '../interfaces/Valorant/ValorantMMROptions';
import ValorantMatchHistoryOptions from '../interfaces/Valorant/ValorantMatchHistoryOptions';

/**
 * Valorant API client for retrieving player stats and match data
 */
export class Valorant {
  private baseUrl: string = 'https://api.henrikdev.xyz/valorant';
  private apiKey?: string;

  /**
   * Create a new Valorant API client
   * @param apiKey Optional API key for Henrik's Valorant API
   */
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Make a request to the Valorant API
   * @param endpoint API endpoint
   * @param params Query parameters
   */
  private async request<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
        params
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as Record<string, unknown>;
        const errorMessage = typeof errorData.message === 'string' 
          ? errorData.message 
          : JSON.stringify(errorData);
        throw new Error(`Valorant API Error: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Get account details by name and tag
   * @param name Player name
   * @param tag Player tag
   */
  async getAccount(name: string, tag: string): Promise<ValorantAccount> {
    const data = await this.request<{ data: ValorantAccount }>(`/v1/account/${name}/${tag}`);
    return data.data;
  }

  /**
   * Get player MMR (Match Making Rating) details
   * @param name Player name 
   * @param tag Player tag
   * @param options Optional parameters
   */
  async getMMR(name: string, tag: string, options: ValorantMMROptions = {}): Promise<Record<string, unknown>> {
    const region = options.region || 'na';
    const data = await this.request<{ data: Record<string, unknown> }>(`/v1/mmr/${region}/${name}/${tag}`);
    return data.data;
  }

  /**
   * Get player's match history
   * @param region Player region
   * @param name Player name
   * @param tag Player tag
   * @param options Optional parameters
   */
  async getMatchHistory(
    region: string,
    name: string,
    tag: string,
    options: ValorantMatchHistoryOptions = {}
  ): Promise<Record<string, unknown>[]> {
    const endpoint = `/v3/matches/${region}/${name}/${tag}`;
    const params: Record<string, unknown> = {};
    
    if (options.queue) {
      params.filter = options.queue;
    }
    
    if (options.startIndex !== undefined && options.endIndex !== undefined) {
      params.size = options.endIndex - options.startIndex + 1;
    }
    
    const data = await this.request<{ data: Record<string, unknown>[] }>(endpoint, params);
    return data.data;
  }

  /**
   * Get player's lifetime stats
   * @param region Player region
   * @param name Player name
   * @param tag Player tag
   */
  async getLifetimeStats(region: string, name: string, tag: string): Promise<Record<string, unknown>> {
    const data = await this.request<{ data: Record<string, unknown> }>(`/v1/lifetime/matches/${region}/${name}/${tag}`);
    return data.data;
  }

  /**
   * Get details for a specific match
   * @param matchId Match ID
   */
  async getMatch(matchId: string): Promise<Record<string, unknown>> {
    const data = await this.request<{ data: Record<string, unknown> }>(`/v2/match/${matchId}`);
    return data.data;
  }

  /**
   * Get current Valorant leaderboard
   * @param options Leaderboard options
   */
  async getLeaderboard(options: ValorantLeaderboardOptions): Promise<Record<string, unknown>[]> {
    const { region, size = 100, startIndex = 0 } = options;
    const data = await this.request<{ data: Record<string, unknown>[] }>(
      `/v1/leaderboard/${region}`,
      { size, startIndex }
    );
    return data.data;
  }

  /**
   * Get agent information
   * @param language Language code (default: en-US)
   */
  async getAgents(language: string = 'en-US'): Promise<Record<string, unknown>[]> {
    const data = await this.request<{ data: Record<string, unknown>[] }>(`/v1/agents`, { language });
    return data.data;
  }

  /**
   * Get weapon information
   * @param language Language code (default: en-US)
   */
  async getWeapons(language: string = 'en-US'): Promise<Record<string, unknown>[]> {
    const data = await this.request<{ data: Record<string, unknown>[] }>(`/v1/weapons`, { language });
    return data.data;
  }

  /**
   * Get map information
   * @param language Language code (default: en-US)
   */
  async getMaps(language: string = 'en-US'): Promise<Record<string, unknown>[]> {
    const data = await this.request<{ data: Record<string, unknown>[] }>(`/v1/maps`, { language });
    return data.data;
  }

  /**
   * Get current Valorant status for a region
   * @param region Region code
   */
  async getStatus(region: string = 'na'): Promise<Record<string, unknown>> {
    const data = await this.request<{ data: Record<string, unknown> }>(`/v1/status/${region}`);
    return data.data;
  }

  /**
   * Get player's recent performance stats
   * @param region Player region
   * @param name Player name
   * @param tag Player tag
   * @param mode Game mode (e.g., 'competitive')
   */
  async getPlayerStats(region: string, name: string, tag: string, mode: string = 'competitive'): Promise<Record<string, unknown>> {
    try {
      // First get the account to verify it exists
      const account = await this.getAccount(name, tag);
      
      // Get recent matches
      const matches = await this.getMatchHistory(region, name, tag, { queue: 'competitive' as ValorantMatchHistoryOptions['queue'] });
      
      if (!matches || matches.length === 0) {
        return { error: 'No recent matches found' };
      }
      
      // Calculate stats from matches
      const stats = this.calculateStats(matches, account.name);
      return stats;
    } catch (error: unknown) {
      console.error('Error getting player stats:', error);
      throw error;
    }
  }

  /**
   * Calculate player stats from match data
   * @param matches Array of match data
   * @param playerName Player name to filter for
   */
  private calculateStats(matches: Record<string, unknown>[], playerName: string): Record<string, unknown> {
    let kills = 0;
    let deaths = 0;
    let assists = 0;
    let wins = 0;
    let games = 0;
    let headshots = 0;
    let totalShots = 0;
    const agentsPlayed: Record<string, number> = {};
    const mapsPlayed: Record<string, number> = {};
    
    matches.forEach(match => {
      // Type-safe access to match properties
      const players = match.players as { all_players?: Record<string, unknown>[] } | undefined;
      const teams = match.teams as { winner?: string } | undefined;
      const metadata = match.metadata as { map?: string } | undefined;
      
      const allPlayers = players?.all_players || [];
      const playerData = allPlayers.find((p: Record<string, unknown>) => {
        const name = p.name as string | undefined;
        return name && name.toLowerCase() === playerName.toLowerCase();
      }) as Record<string, unknown> | undefined;
      
      if (playerData) {
        games++;
        
        // Safely access stats
        const stats = playerData.stats as { 
          kills?: number; 
          deaths?: number; 
          assists?: number;
          headshots?: number;
          bodyshots?: number;
          legshots?: number;
        } | undefined;
        
        const team = playerData.team as string | undefined;
        const character = playerData.character as string | undefined;
        
        if (stats) {
          kills += stats.kills || 0;
          deaths += stats.deaths || 0;
          assists += stats.assists || 0;
          
          if (stats.headshots) {
            headshots += stats.headshots;
          }
          
          // Track total shots if available
          if (stats.bodyshots && stats.legshots && stats.headshots) {
            totalShots += stats.bodyshots + stats.legshots + stats.headshots;
          }
        }
        
        if (team && teams?.winner && team === teams.winner) {
          wins++;
        }
        
        // Track agents played
        if (character) {
          agentsPlayed[character] = (agentsPlayed[character] || 0) + 1;
        }
        
        // Track maps played
        if (metadata?.map) {
          mapsPlayed[metadata.map] = (mapsPlayed[metadata.map] || 0) + 1;
        }
      }
    });
    
    // Calculate derived stats
    const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toString();
    const winRate = games > 0 ? ((wins / games) * 100).toFixed(1) : '0';
    const headshotPercentage = totalShots > 0 ? ((headshots / totalShots) * 100).toFixed(1) : 'N/A';
    
    // Sort agents and maps by frequency
    const favoriteAgent = Object.entries(agentsPlayed)
      .sort((a, b) => b[1] - a[1])
      .map(([agent, count]) => ({ agent, count }));
    
    const favoriteMap = Object.entries(mapsPlayed)
      .sort((a, b) => b[1] - a[1])
      .map(([map, count]) => ({ map, count }));
    
    return {
      overview: {
        matches: games,
        wins,
        losses: games - wins,
        winRate: `${winRate}%`
      },
      combat: {
        kills,
        deaths,
        assists,
        kd,
        headshotPercentage: headshotPercentage !== 'N/A' ? `${headshotPercentage}%` : headshotPercentage
      },
      favorites: {
        agents: favoriteAgent,
        maps: favoriteMap
      }
    };
  }
}