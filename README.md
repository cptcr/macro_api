# macro_api

<div class="text-lg text-gray-700 dark:text-gray-300 mb-6">
A comprehensive API toolkit for various services including YouTube, Spotify, Valorant, DeepSeek, and ChatGPT.
</div>

<div class="flex flex-wrap gap-2 mb-6">
  <a href="https://github.com/cptcr/macro_api/blob/main/LICENSE" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
    <span>License: Apache 2.0</span>
  </a>
  <a href="https://www.npmjs.com/package/macro_api" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
    <span>npm version</span>
  </a>
  <a href="https://www.typescriptlang.org/" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
    <span>TypeScript 4.9.5</span>
  </a>
</div>

## Installation

<div class="mb-6">
  <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
    <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 font-mono text-sm">
      npm install macro_api
    </div>
  </div>

  <div class="text-gray-700 dark:text-gray-300">or</div>

  <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mt-4">
    <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 font-mono text-sm">
      yarn add macro_api
    </div>
  </div>
</div>

## Features

<ul class="space-y-2 mb-6 list-disc pl-5 text-gray-700 dark:text-gray-300">
  <li><strong class="font-semibold">YouTube Notification System</strong>: Monitor YouTube channels and send notifications through Discord webhooks</li>
  <li><strong class="font-semibold">Spotify API Integration</strong>: Complete wrapper for interacting with Spotify API endpoints</li>
  <li><strong class="font-semibold">Valorant Stats</strong>: System to get Valorant player statistics and game data</li>
  <li><strong class="font-semibold">DeepSeek API</strong>: Interface for interacting with DeepSeek AI models</li>
  <li><strong class="font-semibold">ChatGPT API</strong>: Interface for interacting with OpenAI's ChatGPT models</li>
</ul>

## Usage Examples

### YouTube Notification System

<p class="text-gray-700 dark:text-gray-300 mb-4">
Monitor a YouTube channel for new videos and send notifications to Discord:
</p>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
  <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 font-medium">
    TypeScript
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono">
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
  </pre>
</div>

### Spotify API

<p class="text-gray-700 dark:text-gray-300 mb-4">
Interact with Spotify API to get tracks, create playlists, and more:
</p>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
  <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 font-medium">
    TypeScript
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono">
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
  </pre>
</div>

### Valorant Stats

<p class="text-gray-700 dark:text-gray-300 mb-4">
Get player statistics and information from Valorant:
</p>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
  <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 font-medium">
    TypeScript
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono">
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
  </pre>
</div>

### DeepSeek API

<p class="text-gray-700 dark:text-gray-300 mb-4">
Interact with DeepSeek AI models:
</p>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
  <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 font-medium">
    TypeScript
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono">
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
  </pre>
</div>

### GitHub API

<p class="text-gray-700 dark:text-gray-300 mb-4">
Interact with GitHub API to manage repositories, issues, pull requests, and more:
</p>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
  <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 font-medium">
    TypeScript
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono">
import { GitHubAPI } from 'macro_api';

// Create a new GitHub API client
const github = new GitHubAPI({
  token: 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
});

// Get user information
const user = await github.getUser('octocat');
console.log(`Username: ${user.login}, Followers: ${user.followers}`);

// Get repositories for a user
const repos = await github.getUserRepos('octocat', { sort: 'updated', per_page: 5 });
console.log(`Found ${repos.length} repositories`);

// Get a specific repository
const repo = await github.getRepo('octocat', 'Hello-World');
console.log(`Repository: ${repo.name}, Stars: ${repo.stargazers_count}`);

// Create an issue
const issue = await github.createIssue('your-username', 'your-repo', {
  title: 'Found a bug',
  body: 'This is a description of the bug',
  labels: ['bug', 'important']
});
console.log(`Created issue #${issue.number}: ${issue.title}`);

// Create a pull request
const pr = await github.createPullRequest('your-username', 'your-repo', {
  title: 'Fix bug in authentication',
  head: 'fix-auth-bug',
  base: 'main',
  body: 'This PR fixes the authentication issue reported in #42'
});
console.log(`Created PR #${pr.number}`);

// Search repositories
const searchResults = await github.searchRepositories('javascript framework stars:>1000', {
  sort: 'stars',
  order: 'desc',
  per_page: 5
});
console.log(`Found ${searchResults.total_count} repositories`);
searchResults.items.forEach(item => {
  console.log(`${item.full_name} - ${item.stargazers_count} stars`);
});

// Create a release
const release = await github.createRelease('your-username', 'your-repo', {
  tag_name: 'v1.0.0',
  name: 'Version 1.0.0',
  body: 'First stable release with the following features...',
  draft: false,
  prerelease: false
});
console.log(`Created release: ${release.name}, Download URL: ${release.zipball_url}`);
  </pre>
</div>

### ChatGPT API

<p class="text-gray-700 dark:text-gray-300 mb-4">
Interact with OpenAI's models:
</p>

<div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
  <div class="px-4 py-2 bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 font-medium">
    TypeScript
  </div>
  <pre class="p-4 overflow-x-auto text-sm font-mono">
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
  </pre>
</div>

## API Documentation

<div class="space-y-8 mb-6">
  <div>
    <h3 class="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">YouTubeNotify</h3>
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      The YouTube notification system monitors YouTube channels for new videos and sends notifications via Discord webhooks.
    </p>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Constructor</h4>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
      <pre class="p-4 overflow-x-auto text-sm font-mono">
new YouTubeNotify(options: {
  channelId: string;       // YouTube channel ID to monitor
  apiKey: string;          // YouTube Data API key
  checkIntervalMs?: number; // Check interval in milliseconds (default: 600000 - 10 minutes)
  maxResults?: number;     // Maximum number of videos to fetch (default: 5)
  includeDescription?: boolean; // Include video description in notifications (default: false)
  mentionEveryone?: boolean; // Mention @everyone in notifications (default: false)
})
      </pre>
    </div>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Methods</h4>
    <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">setWebhook(url: string)</code>: Set the Discord webhook URL for notifications</li>
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">startMonitoring()</code>: Start monitoring the channel for new videos</li>
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">stopMonitoring()</code>: Stop monitoring the channel</li>
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">manualCheck()</code>: Manually check for new videos and return any found</li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">SpotifyAPI</h3>
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      Complete wrapper for the Spotify API to interact with all endpoints.
    </p>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Constructor</h4>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
      <pre class="p-4 overflow-x-auto text-sm font-mono">
new SpotifyAPI(options: {
  clientId: string;      // Spotify API client ID
  clientSecret: string;  // Spotify API client secret
  redirectUri?: string;  // OAuth redirect URI (required for authorization)
})
      </pre>
    </div>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Authentication Methods</h4>
    <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300 mb-4">
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getAuthorizationUrl(scopes: string[], state?: string)</code>: Get the authorization URL for OAuth login</li>
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">exchangeCode(code: string)</code>: Exchange authorization code for access token</li>
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">setAccessToken(token: string, expiresIn: number, refreshToken?: string)</code>: Set access token manually</li>
      <li><code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">refreshAccessToken()</code>: Refresh the access token using the refresh token</li>
    </ul>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">API Methods</h4>
    <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
      <li><strong>User:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getCurrentUser()</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getUser(userId: string)</code></li>
      <li><strong>Tracks:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getTrack(trackId: string)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getTracks(trackIds: string[])</code></li>
      <li><strong>Albums:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getAlbum(albumId: string)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getAlbumTracks(albumId: string, params?)</code></li>
      <li><strong>Artists:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getArtist(artistId: string)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getArtistAlbums(artistId: string, params?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getArtistTopTracks(artistId: string, market?)</code></li>
      <li><strong>Playlists:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getPlaylist(playlistId: string)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getPlaylistTracks(playlistId: string, params?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createPlaylist(userId: string, name: string, isPublic?, description?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">addTracksToPlaylist(playlistId: string, trackUris: string[], position?)</code></li>
      <li><strong>Player:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getCurrentlyPlaying()</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getPlaybackState()</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">controlPlayback(action: 'play' | 'pause' | 'next' | 'previous', deviceId?)</code></li>
      <li><strong>Search:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">search(query: string, types: Array<'album' | 'artist' | 'playlist' | 'track'>, params?)</code></li>
      <li><strong>Recommendations:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getRecommendations(params)</code></li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">Valorant</h3>
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      API client for retrieving Valorant player statistics and game data.
    </p>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Constructor</h4>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
      <pre class="p-4 overflow-x-auto text-sm font-mono">
new Valorant(apiKey?: string) // Optional API key for Henrik's Valorant API
      </pre>
    </div>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Methods</h4>
    <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
      <li><strong>Account:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getAccount(name: string, tag: string)</code></li>
      <li><strong>MMR:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getMMR(name: string, tag: string, options?: { region?: string })</code></li>
      <li><strong>Match History:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getMatchHistory(region: string, name: string, tag: string, options?)</code></li>
      <li><strong>Stats:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getLifetimeStats(region: string, name: string, tag: string)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getPlayerStats(region: string, name: string, tag: string, mode?)</code></li>
      <li><strong>Match Data:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getMatch(matchId: string)</code></li>
      <li><strong>Leaderboards:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getLeaderboard(options: { region: string, size?: number, startIndex?: number })</code></li>
      <li><strong>Game Data:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getAgents(language?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getWeapons(language?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getMaps(language?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">getStatus(region?)</code></li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">DeepSeek</h3>
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      Client for interacting with DeepSeek's AI models.
    </p>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Constructor</h4>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
      <pre class="p-4 overflow-x-auto text-sm font-mono">
new DeepSeek(config: {
  apiKey: string;      // DeepSeek API key
  baseUrl?: string;    // API base URL (default: 'https://api.deepseek.com/v1')
})
      </pre>
    </div>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Methods</h4>
    <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
      <li><strong>Chat:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createChatCompletion(options)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createStreamingChatCompletion(options, onData, onError?, onEnd?)</code></li>
      <li><strong>Completions:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createCompletion(options)</code></li>
      <li><strong>Embeddings:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createEmbeddings(options)</code></li>
      <li><strong>Helper Methods:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">chat(prompt, systemPrompt?, model?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">conversation(messages, model?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">generateCode(prompt, options?)</code></li>
      <li><strong>Models:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">listModels()</code></li>
    </ul>
  </div>

  <div>
    <h3 class="text-xl font-semibold mb-2 text-primary-600 dark:text-primary-400">ChatGPT</h3>
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      Client for interacting with OpenAI's models.
    </p>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Constructor</h4>
    <div class="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
      <pre class="p-4 overflow-x-auto text-sm font-mono">
new ChatGPT(config: {
  apiKey: string;           // OpenAI API key
  organizationId?: string;  // OpenAI organization ID
  baseUrl?: string;         // API base URL (default: 'https://api.openai.com/v1')
})
      </pre>
    </div>
    
    <h4 class="font-medium mb-2 text-gray-800 dark:text-gray-200">Methods</h4>
    <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300">
      <li><strong>Chat:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createChatCompletion(options)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createStreamingChatCompletion(options, onData, onError?, onEnd?)</code></li>
      <li><strong>Embeddings:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">createEmbeddings(options)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">embed(text, model?)</code></li>
      <li><strong>Helper Methods:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">chat(prompt, systemPrompt?, model?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">conversation(messages, model?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">withFunctions(prompt, functions, model?)</code>, <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">withTools(prompt, tools, model?)</code></li>
      <li><strong>Models:</strong> <code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">listModels()</code></li>
    </ul>
  </div>
</div>

## License

<div class="mb-6 text-gray-700 dark:text-gray-300">
Apache License 2.0. See the <a href="https://github.com/cptcr/macro_api/blob/main/LICENSE" class="text-primary-600 dark:text-primary-400 hover:underline">LICENSE</a> file for details.
</div>

## Contributing

<div class="mb-6 text-gray-700 dark:text-gray-300">
Contributions are welcome! Please feel free to submit a Pull Request.
</div>

## Author

<div class="mb-6 text-gray-700 dark:text-gray-300">
<strong class="font-semibold">CPTCR</strong> - <a href="https://github.com/cptcr" class="text