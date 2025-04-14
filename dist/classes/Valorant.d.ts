import ValorantAccount from '../interfaces/Valorant/ValorantAccount';
import ValorantLeaderboardOptions from '../interfaces/Valorant/ValorantLeaderboardOptions';
import ValorantMMROptions from '../interfaces/Valorant/ValorantMMROptions';
import ValorantMatchHistoryOptions from '../interfaces/Valorant/ValorantMatchHistoryOptions';
/**
 * Valorant API client for retrieving player stats and match data
 */
export declare class Valorant {
    private baseUrl;
    private apiKey?;
    /**
     * Create a new Valorant API client
     * @param apiKey Optional API key for Henrik's Valorant API
     */
    constructor(apiKey?: string);
    /**
     * Get headers for API requests
     */
    private getHeaders;
    /**
     * Make a request to the Valorant API
     * @param endpoint API endpoint
     * @param params Query parameters
     */
    private request;
    /**
     * Get account details by name and tag
     * @param name Player name
     * @param tag Player tag
     */
    getAccount(name: string, tag: string): Promise<ValorantAccount>;
    /**
     * Get player MMR (Match Making Rating) details
     * @param name Player name
     * @param tag Player tag
     * @param options Optional parameters
     */
    getMMR(name: string, tag: string, options?: ValorantMMROptions): Promise<any>;
    /**
     * Get player's match history
     * @param region Player region
     * @param name Player name
     * @param tag Player tag
     * @param options Optional parameters
     */
    getMatchHistory(region: string, name: string, tag: string, options?: ValorantMatchHistoryOptions): Promise<any[]>;
    /**
     * Get player's lifetime stats
     * @param region Player region
     * @param name Player name
     * @param tag Player tag
     */
    getLifetimeStats(region: string, name: string, tag: string): Promise<any>;
    /**
     * Get details for a specific match
     * @param matchId Match ID
     */
    getMatch(matchId: string): Promise<any>;
    /**
     * Get current Valorant leaderboard
     * @param options Leaderboard options
     */
    getLeaderboard(options: ValorantLeaderboardOptions): Promise<any[]>;
    /**
     * Get agent information
     * @param language Language code (default: en-US)
     */
    getAgents(language?: string): Promise<any[]>;
    /**
     * Get weapon information
     * @param language Language code (default: en-US)
     */
    getWeapons(language?: string): Promise<any[]>;
    /**
     * Get map information
     * @param language Language code (default: en-US)
     */
    getMaps(language?: string): Promise<any[]>;
    /**
     * Get current Valorant status for a region
     * @param region Region code
     */
    getStatus(region?: string): Promise<any>;
    /**
     * Get player's recent performance stats
     * @param region Player region
     * @param name Player name
     * @param tag Player tag
     * @param mode Game mode (e.g., 'competitive')
     */
    getPlayerStats(region: string, name: string, tag: string, mode?: string): Promise<any>;
    /**
     * Calculate player stats from match data
     * @param matches Array of match data
     * @param playerName Player name to filter for
     */
    private calculateStats;
}
