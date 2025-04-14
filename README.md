# macro_api

A comprehensive API toolkit for various services including YouTube, Spotify, Valorant, DeepSeek, and ChatGPT.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/cptcr/macro_api/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/macro_api.svg)](https://www.npmjs.com/package/macro_api)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)

## Installation

```bash
npm install macro_api
```

or

```bash
yarn add macro_api
```

## Features

- **YouTube Notification System**: Monitor YouTube channels and send notifications through Discord webhooks
- **Spotify API Integration**: Complete wrapper for interacting with Spotify API endpoints
- **Valorant Stats**: System to get Valorant player statistics and game data
- **DeepSeek API**: Interface for interacting with DeepSeek AI models
- **ChatGPT API**: Interface for interacting with OpenAI's ChatGPT models

## Usage Examples

### YouTube Notification System

Monitor a YouTube channel for new videos and send notifications to Discord:

```typescript
import { YouTubeNotify } from 'macro_api';

// Create a new YouTube notification monitor
const ytNotifier = new YouTubeNotify({
  channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google Developers channel
  apiKey: 'YOUR_YOUTUBE_API_KEY',
  checkIntervalMs: 600000 // 10 minutes
});

// Set up Discord webhook
ytNotifier.setWebhook('https://discord.com/api/webhooks/your-webhook-url');

// Start monitoring
ytNotifier.startMonitoring();

// To stop monitoring
// ytNotifier.stopMonitoring();

// To manually check for new videos
const newVideos = await ytNotifier.manualCheck();
console.log(`Found ${newVideos.length} new videos`);
```

### Spotify API

Interact with Spotify API to get tracks, create playlists, and more:

```typescript
import { SpotifyAPI } from 'macro_api';

// Create a new Spotify API client
const spotify = new SpotifyAPI({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'YOUR_REDIRECT_URI'
});

// Get authorization URL
const authUrl = spotify.getAuthorizationUrl([
  'user-read-private',
  'playlist-modify-public'
]);
console.log(`Please authorize the app: ${authUrl}`);

// Exchange authorization code for access token
await spotify.exchangeCode('AUTHORIZATION_CODE');

// Get the current user
const user = await spotify.getCurrentUser();
console.log(`Logged in as: ${user.display_name}`);

// Search for tracks
const searchResults = await spotify.search('Metallica', ['track'], { limit: 5 });

// Create a playlist and add tracks
const playlist = await spotify.createPlaylist(user.id, 'Awesome Playlist', true, 'Created with macro_api');
await spotify.addTracksToPlaylist(
  playlist.id,
  searchResults.tracks.items.map((track: any) => track.uri)
);
```

### Valorant Stats

Get player statistics and information from Valorant:

```typescript
import { Valorant } from 'macro_api';

// Create a new Valorant API client
const valorant = new Valorant();

// Get player account details
const account = await valorant.getAccount('Username', 'Tag');
console.log(`Player ID: ${account.puuid}`);

// Get player MMR details
const mmr = await valorant.getMMR('Username', 'Tag');
console.log(`Current Rank: ${mmr.currenttierpatched}`);

// Get player's match history
const matches = await valorant.getMatchHistory('na', 'Username', 'Tag', { queue: 'competitive' });
console.log(`Last ${matches.length} matches:`);

// Get player's comprehensive stats
const stats = await valorant.getPlayerStats('na', 'Username', 'Tag');
console.log(`Win Rate: ${stats.overview.winRate}`);
console.log(`K/D Ratio: ${stats.combat.kd}`);
console.log(`Favorite Agent: ${stats.favorites.agents[0]?.agent}`);
```

### DeepSeek API

Interact with DeepSeek AI models:

```typescript
import { DeepSeek } from 'macro_api';

// Create a new DeepSeek API client
const deepseek = new DeepSeek({
  apiKey: 'YOUR_DEEPSEEK_API_KEY'
});

// Simple chat with DeepSeek
const response = await deepseek.chat(
  'What are the main differences between TypeScript and JavaScript?',
  'You are a helpful programming assistant'
);
console.log(response);

// Generate code with DeepSeek
const code = await deepseek.generateCode(
  'Write a function to calculate the Fibonacci sequence'
);
console.log(code.choices[0]?.text);

// Full conversation
const conversation = await deepseek.conversation([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
  { role: 'assistant', content: 'The capital of France is Paris.' },
  { role: 'user', content: 'And what is the population of Paris?' }
]);
console.log(conversation);
```

### ChatGPT API

Interact with OpenAI's models:

```typescript
import { ChatGPT } from 'macro_api';

// Create a new ChatGPT API client
const chatgpt = new ChatGPT({
  apiKey: 'YOUR_OPENAI_API_KEY'
});

// Simple chat with ChatGPT
const response = await chatgpt.chat(
  'Explain the concept of quantum computing in simple terms',
  'You are a helpful assistant that explains complex topics in simple language'
);
console.log(response);

// Using function calling
const functionCall = await chatgpt.withFunctions(
  'What is the weather like in Berlin today?',
  [
    {
      name: 'get_weather',
      description: 'Get the current weather in a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g., San Francisco, CA'
          }
        },
        required: ['location']
      }
    }
  ]
);
console.log(functionCall);

// Generate embeddings
const embeddings = await chatgpt.embed('Hello world');
console.log(`Embedding dimension: ${embeddings[0].embedding.length}`);
```

## API Documentation

### YouTubeNotify

The YouTube notification system monitors YouTube channels for new videos and sends notifications via Discord webhooks.

#### Constructor

```typescript
new YouTubeNotify(options: {
  channelId: string;       // YouTube channel ID to monitor
  apiKey: string;          // YouTube Data API key
  checkIntervalMs?: number; // Check interval in milliseconds (default: 600000 - 10 minutes)
  maxResults?: number;     // Maximum number of videos to fetch (default: 5)
  includeDescription?: boolean; // Include video description in notifications (default: false)
  mentionEveryone?: boolean; // Mention @everyone in notifications (default: false)
})
```

#### Methods

- `setWebhook(url: string)`: Set the Discord webhook URL for notifications
- `startMonitoring()`: Start monitoring the channel for new videos
- `stopMonitoring()`: Stop monitoring the channel
- `manualCheck()`: Manually check for new videos and return any found

### SpotifyAPI

Complete wrapper for the Spotify API to interact with all endpoints.

#### Constructor

```typescript
new SpotifyAPI(options: {
  clientId: string;      // Spotify API client ID
  clientSecret: string;  // Spotify API client secret
  redirectUri?: string;  // OAuth redirect URI (required for authorization)
})
```

#### Authentication Methods

- `getAuthorizationUrl(scopes: string[], state?: string)`: Get the authorization URL for OAuth login
- `exchangeCode(code: string)`: Exchange authorization code for access token
- `setAccessToken(token: string, expiresIn: number, refreshToken?: string)`: Set access token manually
- `refreshAccessToken()`: Refresh the access token using the refresh token

#### API Methods

- User: `getCurrentUser()`, `getUser(userId: string)`
- Tracks: `getTrack(trackId: string)`, `getTracks(trackIds: string[])`
- Albums: `getAlbum(albumId: string)`, `getAlbumTracks(albumId: string, params?)`
- Artists: `getArtist(artistId: string)`, `getArtistAlbums(artistId: string, params?)`, `getArtistTopTracks(artistId: string, market?)`
- Playlists: `getPlaylist(playlistId: string)`, `getPlaylistTracks(playlistId: string, params?)`, `createPlaylist(userId: string, name: string, isPublic?, description?)`, `addTracksToPlaylist(playlistId: string, trackUris: string[], position?)`
- Player: `getCurrentlyPlaying()`, `getPlaybackState()`, `controlPlayback(action: 'play' | 'pause' | 'next' | 'previous', deviceId?)`
- Search: `search(query: string, types: Array<'album' | 'artist' | 'playlist' | 'track'>, params?)`
- Recommendations: `getRecommendations(params)`

### Valorant

API client for retrieving Valorant player statistics and game data.

#### Constructor

```typescript
new Valorant(apiKey?: string) // Optional API key for Henrik's Valorant API
```

#### Methods

- Account: `getAccount(name: string, tag: string)`
- MMR: `getMMR(name: string, tag: string, options?: { region?: string })`
- Match History: `getMatchHistory(region: string, name: string, tag: string, options?)`
- Stats: `getLifetimeStats(region: string, name: string, tag: string)`, `getPlayerStats(region: string, name: string, tag: string, mode?)`
- Match Data: `getMatch(matchId: string)`
- Leaderboards: `getLeaderboard(options: { region: string, size?: number, startIndex?: number })`
- Game Data: `getAgents(language?)`, `getWeapons(language?)`, `getMaps(language?)`, `getStatus(region?)`

### DeepSeek

Client for interacting with DeepSeek's AI models.

#### Constructor

```typescript
new DeepSeek(config: {
  apiKey: string;      // DeepSeek API key
  baseUrl?: string;    // API base URL (default: 'https://api.deepseek.com/v1')
})
```

#### Methods

- Chat: `createChatCompletion(options)`, `createStreamingChatCompletion(options, onData, onError?, onEnd?)`
- Completions: `createCompletion(options)`
- Embeddings: `createEmbeddings(options)`
- Helper Methods: `chat(prompt, systemPrompt?, model?)`, `conversation(messages, model?)`, `generateCode(prompt, options?)`
- Models: `listModels()`

### ChatGPT

Client for interacting with OpenAI's models.

#### Constructor

```typescript
new ChatGPT(config: {
  apiKey: string;           // OpenAI API key
  organizationId?: string;  // OpenAI organization ID
  baseUrl?: string;         // API base URL (default: 'https://api.openai.com/v1')
})
```

#### Methods

- Chat: `createChatCompletion(options)`, `createStreamingChatCompletion(options, onData, onError?, onEnd?)`
- Embeddings: `createEmbeddings(options)`, `embed(text, model?)`
- Helper Methods: `chat(prompt, systemPrompt?, model?)`, `conversation(messages, model?)`, `withFunctions(prompt, functions, model?)`, `withTools(prompt, tools, model?)`
- Models: `listModels()`

## License

Apache License 2.0. See the [LICENSE](https://github.com/cptcr/macro_api/blob/main/LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

- **CPTCR** - [GitHub](https://github.com/cptcr)

## Repository

- [https://github.com/cptcr/macro_api](https://github.com/cptcr/macro_api)