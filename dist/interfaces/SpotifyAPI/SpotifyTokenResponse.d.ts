export default interface SpotifyTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
    refresh_token?: string;
}
