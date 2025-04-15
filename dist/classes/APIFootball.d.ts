import FootballAuthOptions from '../interfaces/FootballAPI/FootballAuthOptions';
/**
 * Complete Football API wrapper for interacting with all API-Football endpoints
 */
export declare class FootballAPI {
    private apiKey;
    private baseUrl;
    /**
     * Create a new Football API client
     * @param options Authentication options
     */
    constructor(options: FootballAuthOptions);
    /**
     * Make a request to the Football API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param params Optional query parameters
     */
    private request;
    /**
     * Get API status
     */
    getStatus(): Promise<any>;
    /**
     * Get available countries
     * @param name Optional country name filter
     */
    getCountries(name?: string): Promise<any>;
    /**
     * Get available leagues
     * @param params Query parameters
     */
    getLeagues(params?: {
        id?: number;
        name?: string;
        country?: string;
        code?: string;
        season?: number;
        current?: boolean;
        search?: string;
    }): Promise<any>;
    /**
     * Get seasons
     */
    getSeasons(): Promise<any>;
    /**
     * Get team information
     * @param params Query parameters
     */
    getTeams(params: {
        id?: number;
        name?: string;
        league?: number;
        season?: number;
        country?: string;
        search?: string;
    }): Promise<any>;
    /**
     * Get team statistics
     * @param params Query parameters
     */
    getTeamStatistics(params: {
        league: number;
        team: number;
        season: number;
    }): Promise<any>;
    /**
     * Get team seasons
     * @param teamId Team ID
     */
    getTeamSeasons(teamId: number): Promise<any>;
    /**
     * Get team countries
     */
    getTeamCountries(): Promise<any>;
    /**
     * Get players
     * @param params Query parameters
     */
    getPlayers(params: {
        id?: number;
        team?: number;
        league?: number;
        season: number;
        search?: string;
        page?: number;
    }): Promise<any>;
    /**
     * Get player seasons
     */
    getPlayerSeasons(): Promise<any>;
    /**
     * Get top scorers
     * @param params Query parameters
     */
    getTopScorers(params: {
        league: number;
        season: number;
    }): Promise<any>;
    /**
     * Get top assists
     * @param params Query parameters
     */
    getTopAssists(params: {
        league: number;
        season: number;
    }): Promise<any>;
    /**
     * Get top yellow cards
     * @param params Query parameters
     */
    getTopYellowCards(params: {
        league: number;
        season: number;
    }): Promise<any>;
    /**
     * Get top red cards
     * @param params Query parameters
     */
    getTopRedCards(params: {
        league: number;
        season: number;
    }): Promise<any>;
    /**
     * Get fixtures
     * @param params Query parameters
     */
    getFixtures(params: {
        id?: number;
        ids?: string;
        league?: number;
        season?: number;
        team?: number;
        date?: string;
        from?: string;
        to?: string;
        round?: string;
        status?: string;
        timezone?: string;
        live?: string;
    }): Promise<any>;
    /**
     * Get fixtures statistics
     * @param fixtureId Fixture ID
     * @param team Optional team ID
     */
    getFixtureStatistics(fixtureId: number, team?: number): Promise<any>;
    /**
     * Get fixture events
     * @param fixtureId Fixture ID
     * @param team Optional team ID
     * @param player Optional player ID
     * @param type Optional event type
     */
    getFixtureEvents(fixtureId: number, team?: number, player?: number, type?: string): Promise<any>;
    /**
     * Get fixture lineups
     * @param fixtureId Fixture ID
     * @param team Optional team ID
     */
    getFixtureLineups(fixtureId: number, team?: number): Promise<any>;
    /**
     * Get head-to-head fixtures
     * @param params Query parameters
     */
    getHeadToHead(params: {
        h2h: string;
        date?: string;
        league?: number;
        season?: number;
        from?: string;
        to?: string;
        status?: string;
    }): Promise<any>;
    /**
     * Get fixture rounds
     * @param params Query parameters
     */
    getFixtureRounds(params: {
        league: number;
        season: number;
        current?: boolean;
    }): Promise<any>;
    /**
     * Get league standings
     * @param params Query parameters
     */
    getStandings(params: {
        league: number;
        season: number;
        team?: number;
    }): Promise<any>;
    /**
     * Get predictions for a fixture
     * @param fixtureId Fixture ID
     */
    getPredictions(fixtureId: number): Promise<any>;
    /**
     * Get odds
     * @param params Query parameters
     */
    getOdds(params: {
        fixture?: number;
        league?: number;
        season?: number;
        date?: string;
        timezone?: string;
        bookmaker?: number;
        bet?: number;
    }): Promise<any>;
    /**
     * Get odds bookmakers
     */
    getOddsBookmakers(): Promise<any>;
    /**
     * Get odds bets
     */
    getOddsBets(): Promise<any>;
    /**
     * Get odds mapping
     */
    getOddsMapping(): Promise<any>;
    /**
     * Get transfers
     * @param params Query parameters
     */
    getTransfers(params: {
        player?: number;
        team?: number;
    }): Promise<any>;
    /**
     * Get player trophies
     * @param playerId Player ID
     */
    getPlayerTrophies(playerId: number): Promise<any>;
    /**
     * Get coach trophies
     * @param coachId Coach ID
     */
    getCoachTrophies(coachId: number): Promise<any>;
    /**
     * Get venues
     * @param params Query parameters
     */
    getVenues(params: {
        id?: number;
        name?: string;
        city?: string;
        country?: string;
    }): Promise<any>;
    /**
     * Get coaches
     * @param params Query parameters
     */
    getCoaches(params: {
        id?: number;
        team?: number;
        search?: string;
    }): Promise<any>;
    /**
     * Get sidelined players
     * @param params Query parameters
     */
    getSidelined(params: {
        player?: number;
        coach?: number;
    }): Promise<any>;
    /**
     * Get injuries
     * @param params Query parameters
     */
    getInjuries(params: {
        league?: number;
        season?: number;
        team?: number;
        player?: number;
        fixture?: number;
    }): Promise<any>;
}
