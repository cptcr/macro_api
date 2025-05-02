"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Complete Spotify API wrapper for interacting with all Spotify endpoints
 */
class SpotifyAPI {
    /**
     * Create a new Spotify API client
     * @param options Authentication options
     */
    constructor(options) {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = 0;
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;
        this.redirectUri = options.redirectUri;
    }
    /**
     * Get the authorization URL for OAuth login
     * @param scopes List of permission scopes to request
     * @param state Optional state parameter for security
     */
    getAuthorizationUrl(scopes, state) {
        if (!this.redirectUri) {
            throw new Error('Redirect URI is required for authorization');
        }
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            scope: scopes.join(' ')
        });
        if (state) {
            params.append('state', state);
        }
        return `https://accounts.spotify.com/authorize?${params.toString()}`;
    }
    /**
     * Exchange authorization code for access token
     * @param code Authorization code from Spotify
     */
    async exchangeCode(code) {
        if (!this.redirectUri) {
            throw new Error('Redirect URI is required for code exchange');
        }
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri
        });
        const response = await this.makeTokenRequest(params);
        this.setTokenData(response);
    }
    /**
     * Set access token manually
     * @param token Access token
     * @param expiresIn Expiry time in seconds
     * @param refreshToken Optional refresh token
     */
    setAccessToken(token, expiresIn, refreshToken) {
        this.accessToken = token;
        this.tokenExpiry = Date.now() + (expiresIn * 1000);
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
    /**
     * Refresh the access token using the refresh token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken
        });
        const response = await this.makeTokenRequest(params);
        this.setTokenData(response);
    }
    /**
     * Make a token request to the Spotify API
     * @param params URL parameters
     */
    async makeTokenRequest(params) {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios_1.default.post('https://accounts.spotify.com/api/token', params.toString(), {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    }
    /**
     * Set token data from response
     * @param data Token response data
     */
    setTokenData(data) {
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        if (data.refresh_token) {
            this.refreshToken = data.refresh_token;
        }
    }
    /**
     * Ensure we have a valid access token
     */
    async ensureAccessToken() {
        if (!this.accessToken || Date.now() >= this.tokenExpiry) {
            if (this.refreshToken) {
                await this.refreshAccessToken();
            }
            else {
                throw new Error('No access token available and no refresh token to get a new one');
            }
        }
        return this.accessToken;
    }
    /**
     * Make an authenticated request to the Spotify API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    async request(method, endpoint, data, params) {
        const token = await this.ensureAccessToken();
        const response = await (0, axios_1.default)({
            method,
            url: `https://api.spotify.com/v1${endpoint}`,
            data,
            params,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
    // User endpoints
    /**
     * Get the current user's profile
     */
    async getCurrentUser() {
        return this.request('get', '/me');
    }
    /**
     * Get a user's profile by ID
     * @param userId Spotify user ID
     */
    async getUser(userId) {
        return this.request('get', `/users/${userId}`);
    }
    // Track endpoints
    /**
     * Get a track by ID
     * @param trackId Spotify track ID
     */
    async getTrack(trackId) {
        return this.request('get', `/tracks/${trackId}`);
    }
    /**
     * Get multiple tracks by IDs
     * @param trackIds Array of Spotify track IDs
     */
    async getTracks(trackIds) {
        return this.request('get', '/tracks', undefined, {
            ids: trackIds.join(',')
        });
    }
    // Album endpoints
    /**
     * Get an album by ID
     * @param albumId Spotify album ID
     */
    async getAlbum(albumId) {
        return this.request('get', `/albums/${albumId}`);
    }
    /**
     * Get an album's tracks
     * @param albumId Spotify album ID
     * @param params Pagination parameters
     */
    async getAlbumTracks(albumId, params) {
        return this.request('get', `/albums/${albumId}/tracks`, undefined, params);
    }
    // Artist endpoints
    /**
     * Get an artist by ID
     * @param artistId Spotify artist ID
     */
    async getArtist(artistId) {
        return this.request('get', `/artists/${artistId}`);
    }
    /**
     * Get an artist's albums
     * @param artistId Spotify artist ID
     * @param params Pagination parameters
     */
    async getArtistAlbums(artistId, params) {
        return this.request('get', `/artists/${artistId}/albums`, undefined, params);
    }
    /**
     * Get an artist's top tracks
     * @param artistId Spotify artist ID
     * @param market Market code
     */
    async getArtistTopTracks(artistId, market = 'US') {
        return this.request('get', `/artists/${artistId}/top-tracks`, undefined, { market });
    }
    // Playlist endpoints
    /**
     * Get a playlist by ID
     * @param playlistId Spotify playlist ID
     */
    async getPlaylist(playlistId) {
        return this.request('get', `/playlists/${playlistId}`);
    }
    /**
     * Get a playlist's tracks
     * @param playlistId Spotify playlist ID
     * @param params Pagination parameters
     */
    async getPlaylistTracks(playlistId, params) {
        return this.request('get', `/playlists/${playlistId}/tracks`, undefined, params);
    }
    /**
     * Create a playlist
     * @param userId Spotify user ID
     * @param name Playlist name
     * @param isPublic Whether the playlist is public
     * @param description Playlist description
     */
    async createPlaylist(userId, name, isPublic = true, description) {
        return this.request('post', `/users/${userId}/playlists`, {
            name,
            public: isPublic,
            description
        });
    }
    /**
     * Add tracks to a playlist
     * @param playlistId Spotify playlist ID
     * @param trackUris Array of Spotify track URIs
     * @param position Position to insert tracks
     */
    async addTracksToPlaylist(playlistId, trackUris, position) {
        return this.request('post', `/playlists/${playlistId}/tracks`, {
            uris: trackUris,
            position
        });
    }
    // Player endpoints
    /**
     * Get the user's currently played track
     */
    async getCurrentlyPlaying() {
        return this.request('get', '/me/player/currently-playing');
    }
    /**
     * Get the user's playback state
     */
    async getPlaybackState() {
        return this.request('get', '/me/player');
    }
    /**
     * Control playback
     * @param action Playback action (play, pause, next, previous)
     * @param deviceId Optional Spotify device ID
     */
    async controlPlayback(action, deviceId) {
        const params = deviceId ? { device_id: deviceId } : undefined;
        return this.request('put', `/me/player/${action}`, undefined, params);
    }
    // Search endpoint
    /**
     * Search the Spotify catalog
     * @param query Search query
     * @param types Array of item types to search
     * @param params Pagination and market parameters
     */
    async search(query, types, params) {
        return this.request('get', '/search', undefined, {
            q: query,
            type: types.join(','),
            ...params
        });
    }
    // Recommendations endpoint
    /**
     * Get track recommendations
     * @param params Recommendation parameters
     */
    async getRecommendations(params) {
        // Convert arrays to comma-separated strings
        const queryParams = { ...params };
        if (params.seed_artists)
            queryParams.seed_artists = params.seed_artists.join(',');
        if (params.seed_tracks)
            queryParams.seed_tracks = params.seed_tracks.join(',');
        if (params.seed_genres)
            queryParams.seed_genres = params.seed_genres.join(',');
        return this.request('get', '/recommendations', undefined, queryParams);
    }
}
exports.SpotifyAPI = SpotifyAPI;
