"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Complete Football API wrapper for interacting with all API-Football endpoints
 */
class FootballAPI {
    /**
     * Create a new Football API client
     * @param options Authentication options
     */
    constructor(options) {
        this.baseUrl = 'https://api-football-v1.p.rapidapi.com/v3';
        this.apiKey = options.apiKey;
    }
    /**
     * Make a request to the Football API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param params Optional query parameters
     */
    async request(method, endpoint, params) {
        const response = await (0, axios_1.default)({
            method,
            url: `${this.baseUrl}${endpoint}`,
            params,
            headers: {
                'x-rapidapi-key': this.apiKey,
                'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
            }
        });
        return response.data;
    }
    // Status endpoints
    /**
     * Get API status
     */
    async getStatus() {
        return this.request('get', '/status');
    }
    // Countries endpoints
    /**
     * Get available countries
     * @param name Optional country name filter
     */
    async getCountries(name) {
        return this.request('get', '/countries', { name });
    }
    // Leagues endpoints
    /**
     * Get available leagues
     * @param params Query parameters
     */
    async getLeagues(params) {
        return this.request('get', '/leagues', params);
    }
    /**
     * Get seasons
     */
    async getSeasons() {
        return this.request('get', '/leagues/seasons');
    }
    // Teams endpoints
    /**
     * Get team information
     * @param params Query parameters
     */
    async getTeams(params) {
        return this.request('get', '/teams', params);
    }
    /**
     * Get team statistics
     * @param params Query parameters
     */
    async getTeamStatistics(params) {
        return this.request('get', '/teams/statistics', params);
    }
    /**
     * Get team seasons
     * @param teamId Team ID
     */
    async getTeamSeasons(teamId) {
        return this.request('get', '/teams/seasons', { team: teamId });
    }
    /**
     * Get team countries
     */
    async getTeamCountries() {
        return this.request('get', '/teams/countries');
    }
    // Players endpoints
    /**
     * Get players
     * @param params Query parameters
     */
    async getPlayers(params) {
        return this.request('get', '/players', params);
    }
    /**
     * Get player seasons
     */
    async getPlayerSeasons() {
        return this.request('get', '/players/seasons');
    }
    /**
     * Get top scorers
     * @param params Query parameters
     */
    async getTopScorers(params) {
        return this.request('get', '/players/topscorers', params);
    }
    /**
     * Get top assists
     * @param params Query parameters
     */
    async getTopAssists(params) {
        return this.request('get', '/players/topassists', params);
    }
    /**
     * Get top yellow cards
     * @param params Query parameters
     */
    async getTopYellowCards(params) {
        return this.request('get', '/players/topyellowcards', params);
    }
    /**
     * Get top red cards
     * @param params Query parameters
     */
    async getTopRedCards(params) {
        return this.request('get', '/players/topredcards', params);
    }
    // Fixtures endpoints
    /**
     * Get fixtures
     * @param params Query parameters
     */
    async getFixtures(params) {
        return this.request('get', '/fixtures', params);
    }
    /**
     * Get fixtures statistics
     * @param fixtureId Fixture ID
     * @param team Optional team ID
     */
    async getFixtureStatistics(fixtureId, team) {
        return this.request('get', '/fixtures/statistics', {
            fixture: fixtureId,
            team
        });
    }
    /**
     * Get fixture events
     * @param fixtureId Fixture ID
     * @param team Optional team ID
     * @param player Optional player ID
     * @param type Optional event type
     */
    async getFixtureEvents(fixtureId, team, player, type) {
        return this.request('get', '/fixtures/events', {
            fixture: fixtureId,
            team,
            player,
            type
        });
    }
    /**
     * Get fixture lineups
     * @param fixtureId Fixture ID
     * @param team Optional team ID
     */
    async getFixtureLineups(fixtureId, team) {
        return this.request('get', '/fixtures/lineups', {
            fixture: fixtureId,
            team
        });
    }
    /**
     * Get head-to-head fixtures
     * @param params Query parameters
     */
    async getHeadToHead(params) {
        return this.request('get', '/fixtures/headtohead', params);
    }
    /**
     * Get fixture rounds
     * @param params Query parameters
     */
    async getFixtureRounds(params) {
        return this.request('get', '/fixtures/rounds', params);
    }
    // Standings endpoints
    /**
     * Get league standings
     * @param params Query parameters
     */
    async getStandings(params) {
        return this.request('get', '/standings', params);
    }
    // Predictions endpoints
    /**
     * Get predictions for a fixture
     * @param fixtureId Fixture ID
     */
    async getPredictions(fixtureId) {
        return this.request('get', '/predictions', { fixture: fixtureId });
    }
    // Odds endpoints
    /**
     * Get odds
     * @param params Query parameters
     */
    async getOdds(params) {
        return this.request('get', '/odds', params);
    }
    /**
     * Get odds bookmakers
     */
    async getOddsBookmakers() {
        return this.request('get', '/odds/bookmakers');
    }
    /**
     * Get odds bets
     */
    async getOddsBets() {
        return this.request('get', '/odds/bets');
    }
    /**
     * Get odds mapping
     */
    async getOddsMapping() {
        return this.request('get', '/odds/mapping');
    }
    // Transfers endpoints
    /**
     * Get transfers
     * @param params Query parameters
     */
    async getTransfers(params) {
        return this.request('get', '/transfers', params);
    }
    // Trophies endpoints
    /**
     * Get player trophies
     * @param playerId Player ID
     */
    async getPlayerTrophies(playerId) {
        return this.request('get', '/trophies', { player: playerId });
    }
    /**
     * Get coach trophies
     * @param coachId Coach ID
     */
    async getCoachTrophies(coachId) {
        return this.request('get', '/trophies', { coach: coachId });
    }
    // Venue endpoints
    /**
     * Get venues
     * @param params Query parameters
     */
    async getVenues(params) {
        return this.request('get', '/venues', params);
    }
    // Coaches endpoints
    /**
     * Get coaches
     * @param params Query parameters
     */
    async getCoaches(params) {
        return this.request('get', '/coachs', params);
    }
    // Sidelined endpoints
    /**
     * Get sidelined players
     * @param params Query parameters
     */
    async getSidelined(params) {
        return this.request('get', '/sidelined', params);
    }
    // Injuries endpoints
    /**
     * Get injuries
     * @param params Query parameters
     */
    async getInjuries(params) {
        return this.request('get', '/injuries', params);
    }
}
exports.FootballAPI = FootballAPI;
