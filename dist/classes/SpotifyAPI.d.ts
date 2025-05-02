import SpotifyAuthOptions from '../interfaces/SpotifyAPI/SpotifyAuthOptions';
import SpotifyPaginationParams from '../interfaces/SpotifyAPI/SpotifyPaginationParams';
/**
 * Complete Spotify API wrapper for interacting with all Spotify endpoints
 */
export declare class SpotifyAPI {
    private clientId;
    private clientSecret;
    private redirectUri?;
    private accessToken;
    private refreshToken;
    private tokenExpiry;
    /**
     * Create a new Spotify API client
     * @param options Authentication options
     */
    constructor(options: SpotifyAuthOptions);
    /**
     * Get the authorization URL for OAuth login
     * @param scopes List of permission scopes to request
     * @param state Optional state parameter for security
     */
    getAuthorizationUrl(scopes: string[], state?: string): string;
    /**
     * Exchange authorization code for access token
     * @param code Authorization code from Spotify
     */
    exchangeCode(code: string): Promise<void>;
    /**
     * Set access token manually
     * @param token Access token
     * @param expiresIn Expiry time in seconds
     * @param refreshToken Optional refresh token
     */
    setAccessToken(token: string, expiresIn: number, refreshToken?: string): void;
    /**
     * Refresh the access token using the refresh token
     */
    refreshAccessToken(): Promise<void>;
    /**
     * Make a token request to the Spotify API
     * @param params URL parameters
     */
    private makeTokenRequest;
    /**
     * Set token data from response
     * @param data Token response data
     */
    private setTokenData;
    /**
     * Ensure we have a valid access token
     */
    private ensureAccessToken;
    /**
     * Make an authenticated request to the Spotify API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Optional request body
     * @param params Optional query parameters
     */
    private request;
    /**
     * Get the current user's profile
     */
    getCurrentUser(): Promise<any>;
    /**
     * Get a user's profile by ID
     * @param userId Spotify user ID
     */
    getUser(userId: string): Promise<any>;
    /**
     * Get a track by ID
     * @param trackId Spotify track ID
     */
    getTrack(trackId: string): Promise<any>;
    /**
     * Get multiple tracks by IDs
     * @param trackIds Array of Spotify track IDs
     */
    getTracks(trackIds: string[]): Promise<any>;
    /**
     * Get an album by ID
     * @param albumId Spotify album ID
     */
    getAlbum(albumId: string): Promise<any>;
    /**
     * Get an album's tracks
     * @param albumId Spotify album ID
     * @param params Pagination parameters
     */
    getAlbumTracks(albumId: string, params?: SpotifyPaginationParams): Promise<any>;
    /**
     * Get an artist by ID
     * @param artistId Spotify artist ID
     */
    getArtist(artistId: string): Promise<any>;
    /**
     * Get an artist's albums
     * @param artistId Spotify artist ID
     * @param params Pagination parameters
     */
    getArtistAlbums(artistId: string, params?: SpotifyPaginationParams & {
        include_groups?: string;
        market?: string;
    }): Promise<any>;
    /**
     * Get an artist's top tracks
     * @param artistId Spotify artist ID
     * @param market Market code
     */
    getArtistTopTracks(artistId: string, market?: string): Promise<any>;
    /**
     * Get a playlist by ID
     * @param playlistId Spotify playlist ID
     */
    getPlaylist(playlistId: string): Promise<any>;
    /**
     * Get a playlist's tracks
     * @param playlistId Spotify playlist ID
     * @param params Pagination parameters
     */
    getPlaylistTracks(playlistId: string, params?: SpotifyPaginationParams): Promise<any>;
    /**
     * Create a playlist
     * @param userId Spotify user ID
     * @param name Playlist name
     * @param isPublic Whether the playlist is public
     * @param description Playlist description
     */
    createPlaylist(userId: string, name: string, isPublic?: boolean, description?: string): Promise<any>;
    /**
     * Add tracks to a playlist
     * @param playlistId Spotify playlist ID
     * @param trackUris Array of Spotify track URIs
     * @param position Position to insert tracks
     */
    addTracksToPlaylist(playlistId: string, trackUris: string[], position?: number): Promise<any>;
    /**
     * Get the user's currently played track
     */
    getCurrentlyPlaying(): Promise<any>;
    /**
     * Get the user's playback state
     */
    getPlaybackState(): Promise<any>;
    /**
     * Control playback
     * @param action Playback action (play, pause, next, previous)
     * @param deviceId Optional Spotify device ID
     */
    controlPlayback(action: 'play' | 'pause' | 'next' | 'previous', deviceId?: string): Promise<any>;
    /**
     * Search the Spotify catalog
     * @param query Search query
     * @param types Array of item types to search
     * @param params Pagination and market parameters
     */
    search(query: string, types: Array<'album' | 'artist' | 'playlist' | 'track'>, params?: SpotifyPaginationParams & {
        market?: string;
    }): Promise<any>;
    /**
     * Get track recommendations
     * @param params Recommendation parameters
     */
    getRecommendations(params: {
        seed_artists?: string[];
        seed_tracks?: string[];
        seed_genres?: string[];
        limit?: number;
        [key: string]: any;
    }): Promise<any>;
}
