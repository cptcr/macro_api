"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Valorant = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Valorant API client for retrieving player stats and match data
 */
class Valorant {
    /**
     * Create a new Valorant API client
     * @param apiKey Optional API key for Henrik's Valorant API
     */
    constructor(apiKey) {
        this.baseUrl = 'https://api.henrikdev.xyz/valorant';
        this.apiKey = apiKey;
    }
    /**
     * Get headers for API requests
     */
    getHeaders() {
        const headers = {
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
    async request(endpoint, params) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}${endpoint}`, {
                headers: this.getHeaders(),
                params
            });
            return response.data;
        }
        catch (error) {
            if (error.response && error.response.data) {
                throw new Error(`Valorant API Error: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Get account details by name and tag
     * @param name Player name
     * @param tag Player tag
     */
    async getAccount(name, tag) {
        const data = await this.request(`/v1/account/${name}/${tag}`);
        return data.data;
    }
    /**
     * Get player MMR (Match Making Rating) details
     * @param name Player name
     * @param tag Player tag
     * @param options Optional parameters
     */
    async getMMR(name, tag, options = {}) {
        const region = options.region || 'na';
        const data = await this.request(`/v1/mmr/${region}/${name}/${tag}`);
        return data.data;
    }
    /**
     * Get player's match history
     * @param region Player region
     * @param name Player name
     * @param tag Player tag
     * @param options Optional parameters
     */
    async getMatchHistory(region, name, tag, options = {}) {
        const endpoint = `/v3/matches/${region}/${name}/${tag}`;
        const params = {};
        if (options.queue) {
            params.filter = options.queue;
        }
        if (options.startIndex !== undefined && options.endIndex !== undefined) {
            params.size = options.endIndex - options.startIndex + 1;
        }
        const data = await this.request(endpoint, params);
        return data.data;
    }
    /**
     * Get player's lifetime stats
     * @param region Player region
     * @param name Player name
     * @param tag Player tag
     */
    async getLifetimeStats(region, name, tag) {
        const data = await this.request(`/v1/lifetime/matches/${region}/${name}/${tag}`);
        return data.data;
    }
    /**
     * Get details for a specific match
     * @param matchId Match ID
     */
    async getMatch(matchId) {
        const data = await this.request(`/v2/match/${matchId}`);
        return data.data;
    }
    /**
     * Get current Valorant leaderboard
     * @param options Leaderboard options
     */
    async getLeaderboard(options) {
        const { region, size = 100, startIndex = 0 } = options;
        const data = await this.request(`/v1/leaderboard/${region}`, { size, startIndex });
        return data.data;
    }
    /**
     * Get agent information
     * @param language Language code (default: en-US)
     */
    async getAgents(language = 'en-US') {
        const data = await this.request(`/v1/agents`, { language });
        return data.data;
    }
    /**
     * Get weapon information
     * @param language Language code (default: en-US)
     */
    async getWeapons(language = 'en-US') {
        const data = await this.request(`/v1/weapons`, { language });
        return data.data;
    }
    /**
     * Get map information
     * @param language Language code (default: en-US)
     */
    async getMaps(language = 'en-US') {
        const data = await this.request(`/v1/maps`, { language });
        return data.data;
    }
    /**
     * Get current Valorant status for a region
     * @param region Region code
     */
    async getStatus(region = 'na') {
        const data = await this.request(`/v1/status/${region}`);
        return data.data;
    }
    /**
     * Get player's recent performance stats
     * @param region Player region
     * @param name Player name
     * @param tag Player tag
     * @param mode Game mode (e.g., 'competitive')
     */
    async getPlayerStats(region, name, tag, mode = 'competitive') {
        try {
            // First get the account to verify it exists
            const account = await this.getAccount(name, tag);
            // Get recent matches
            const matches = await this.getMatchHistory(region, name, tag, { queue: 'competitive' });
            if (!matches || matches.length === 0) {
                return { error: 'No recent matches found' };
            }
            // Calculate stats from matches
            const stats = this.calculateStats(matches, account.name);
            return stats;
        }
        catch (error) {
            console.error('Error getting player stats:', error);
            throw error;
        }
    }
    /**
     * Calculate player stats from match data
     * @param matches Array of match data
     * @param playerName Player name to filter for
     */
    calculateStats(matches, playerName) {
        let kills = 0;
        let deaths = 0;
        let assists = 0;
        let wins = 0;
        let games = 0;
        let headshots = 0;
        let totalShots = 0;
        const agentsPlayed = {};
        const mapsPlayed = {};
        matches.forEach(match => {
            const playerData = match.players.all_players.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
            if (playerData) {
                games++;
                kills += playerData.stats.kills;
                deaths += playerData.stats.deaths;
                assists += playerData.stats.assists;
                if (playerData.team === match.teams.winner) {
                    wins++;
                }
                // Track headshots if available
                if (playerData.stats.headshots) {
                    headshots += playerData.stats.headshots;
                }
                // Track total shots if available
                if (playerData.stats.bodyshots && playerData.stats.legshots && playerData.stats.headshots) {
                    totalShots += playerData.stats.bodyshots + playerData.stats.legshots + playerData.stats.headshots;
                }
                // Track agents played
                if (playerData.character) {
                    agentsPlayed[playerData.character] = (agentsPlayed[playerData.character] || 0) + 1;
                }
                // Track maps played
                if (match.metadata && match.metadata.map) {
                    mapsPlayed[match.metadata.map] = (mapsPlayed[match.metadata.map] || 0) + 1;
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
exports.Valorant = Valorant;
