import axios from 'axios';
import FootballAuthOptions from '../interfaces/FootballAPI/FootballAuthOptions';

/**
 * Complete Football API wrapper for interacting with all API-Football endpoints
 */
export class FootballAPI {
  private apiKey: string;
  private baseUrl: string = 'https://api-football-v1.p.rapidapi.com/v3';
  
  /**
   * Create a new Football API client
   * @param options Authentication options
   */
  constructor(options: FootballAuthOptions) {
    this.apiKey = options.apiKey;
  }

  /**
   * Make a request to the Football API
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param params Optional query parameters
   */
  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await axios({
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
    return this.request<Record<string, unknown>>('get', '/status');
  }

  // Countries endpoints

  /**
   * Get available countries
   * @param name Optional country name filter
   */
  async getCountries(name?: string) {
    return this.request<Record<string, unknown>>('get', '/countries', { name });
  }

  // Leagues endpoints

  /**
   * Get available leagues
   * @param params Query parameters
   */
  async getLeagues(params?: {
    id?: number;
    name?: string;
    country?: string;
    code?: string;
    season?: number;
    current?: boolean;
    search?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/leagues', params);
  }

  /**
   * Get seasons
   */
  async getSeasons() {
    return this.request<Record<string, unknown>>('get', '/leagues/seasons');
  }

  // Teams endpoints

  /**
   * Get team information
   * @param params Query parameters
   */
  async getTeams(params: {
    id?: number;
    name?: string;
    league?: number;
    season?: number;
    country?: string;
    search?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/teams', params);
  }

  /**
   * Get team statistics
   * @param params Query parameters
   */
  async getTeamStatistics(params: {
    league: number;
    team: number;
    season: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/teams/statistics', params);
  }

  /**
   * Get team seasons
   * @param teamId Team ID
   */
  async getTeamSeasons(teamId: number) {
    return this.request<Record<string, unknown>>('get', '/teams/seasons', { team: teamId });
  }

  /**
   * Get team countries
   */
  async getTeamCountries() {
    return this.request<Record<string, unknown>>('get', '/teams/countries');
  }

  // Players endpoints

  /**
   * Get players
   * @param params Query parameters
   */
  async getPlayers(params: {
    id?: number;
    team?: number;
    league?: number;
    season: number;
    search?: string;
    page?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/players', params);
  }

  /**
   * Get player seasons
   */
  async getPlayerSeasons() {
    return this.request<Record<string, unknown>>('get', '/players/seasons');
  }

  /**
   * Get top scorers
   * @param params Query parameters
   */
  async getTopScorers(params: {
    league: number;
    season: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/players/topscorers', params);
  }

  /**
   * Get top assists
   * @param params Query parameters
   */
  async getTopAssists(params: {
    league: number;
    season: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/players/topassists', params);
  }

  /**
   * Get top yellow cards
   * @param params Query parameters
   */
  async getTopYellowCards(params: {
    league: number;
    season: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/players/topyellowcards', params);
  }

  /**
   * Get top red cards
   * @param params Query parameters
   */
  async getTopRedCards(params: {
    league: number;
    season: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/players/topredcards', params);
  }

  // Fixtures endpoints

  /**
   * Get fixtures
   * @param params Query parameters
   */
  async getFixtures(params: {
    id?: number;
    ids?: string; // Comma separated list of fixture IDs
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
  }) {
    return this.request<Record<string, unknown>>('get', '/fixtures', params);
  }

  /**
   * Get fixtures statistics
   * @param fixtureId Fixture ID
   * @param team Optional team ID
   */
  async getFixtureStatistics(fixtureId: number, team?: number) {
    return this.request<Record<string, unknown>>('get', '/fixtures/statistics', { 
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
  async getFixtureEvents(fixtureId: number, team?: number, player?: number, type?: string) {
    return this.request<Record<string, unknown>>('get', '/fixtures/events', { 
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
  async getFixtureLineups(fixtureId: number, team?: number) {
    return this.request<Record<string, unknown>>('get', '/fixtures/lineups', { 
      fixture: fixtureId,
      team
    });
  }

  /**
   * Get head-to-head fixtures
   * @param params Query parameters
   */
  async getHeadToHead(params: {
    h2h: string; // Format: "teamId1-teamId2"
    date?: string;
    league?: number;
    season?: number;
    from?: string;
    to?: string;
    status?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/fixtures/headtohead', params);
  }

  /**
   * Get fixture rounds
   * @param params Query parameters
   */
  async getFixtureRounds(params: {
    league: number;
    season: number;
    current?: boolean;
  }) {
    return this.request<Record<string, unknown>>('get', '/fixtures/rounds', params);
  }

  // Standings endpoints

  /**
   * Get league standings
   * @param params Query parameters
   */
  async getStandings(params: {
    league: number;
    season: number;
    team?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/standings', params);
  }

  // Predictions endpoints

  /**
   * Get predictions for a fixture
   * @param fixtureId Fixture ID
   */
  async getPredictions(fixtureId: number) {
    return this.request<Record<string, unknown>>('get', '/predictions', { fixture: fixtureId });
  }

  // Odds endpoints

  /**
   * Get odds
   * @param params Query parameters
   */
  async getOdds(params: {
    fixture?: number;
    league?: number;
    season?: number;
    date?: string;
    timezone?: string;
    bookmaker?: number;
    bet?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/odds', params);
  }

  /**
   * Get odds bookmakers
   */
  async getOddsBookmakers() {
    return this.request<Record<string, unknown>>('get', '/odds/bookmakers');
  }

  /**
   * Get odds bets
   */
  async getOddsBets() {
    return this.request<Record<string, unknown>>('get', '/odds/bets');
  }

  /**
   * Get odds mapping
   */
  async getOddsMapping() {
    return this.request<Record<string, unknown>>('get', '/odds/mapping');
  }

  // Transfers endpoints

  /**
   * Get transfers
   * @param params Query parameters
   */
  async getTransfers(params: {
    player?: number;
    team?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/transfers', params);
  }

  // Trophies endpoints

  /**
   * Get player trophies
   * @param playerId Player ID
   */
  async getPlayerTrophies(playerId: number) {
    return this.request<Record<string, unknown>>('get', '/trophies', { player: playerId });
  }

  /**
   * Get coach trophies
   * @param coachId Coach ID
   */
  async getCoachTrophies(coachId: number) {
    return this.request<Record<string, unknown>>('get', '/trophies', { coach: coachId });
  }

  // Venue endpoints

  /**
   * Get venues
   * @param params Query parameters
   */
  async getVenues(params: {
    id?: number;
    name?: string;
    city?: string;
    country?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/venues', params);
  }

  // Coaches endpoints

  /**
   * Get coaches
   * @param params Query parameters
   */
  async getCoaches(params: {
    id?: number;
    team?: number;
    search?: string;
  }) {
    return this.request<Record<string, unknown>>('get', '/coachs', params);
  }

  // Sidelined endpoints

  /**
   * Get sidelined players
   * @param params Query parameters
   */
  async getSidelined(params: {
    player?: number;
    coach?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/sidelined', params);
  }

  // Injuries endpoints

  /**
   * Get injuries
   * @param params Query parameters
   */
  async getInjuries(params: {
    league?: number;
    season?: number;
    team?: number;
    player?: number;
    fixture?: number;
  }) {
    return this.request<Record<string, unknown>>('get', '/injuries', params);
  }
}

