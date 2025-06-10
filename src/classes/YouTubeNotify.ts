import axios from 'axios';
import NotificationOptions from '../interfaces/YouTube/NotificationOptions';
import YouTubeVideo from '../interfaces/YouTube/YouTubeVideo';

/**
 * Interface for YouTube API response items
 */
interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      default?: { url: string };
      medium?: { url: string };
    };
  };
}

/**
 * Interface for YouTube API search response
 */
interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
}

/**
 * YouTube notification system that monitors channels and sends notifications to Discord via webhooks
 */
export class YouTubeNotify {
  private channelId: string;
  private apiKey: string;
  private webhookUrl: string | null = null;
  private checkInterval: number;
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheckedVideos: Set<string> = new Set();
  private maxResults: number;
  private includeDescription: boolean;
  private mentionEveryone: boolean;

  /**
   * Create a new YouTube notification system
   * @param options Configuration options
   */
  constructor(options: NotificationOptions) {
    this.channelId = options.channelId;
    this.apiKey = options.apiKey;
    this.checkInterval = options.checkIntervalMs || 600000; // Default 10 minutes
    this.maxResults = options.maxResults || 5;
    this.includeDescription = options.includeDescription || false;
    this.mentionEveryone = options.mentionEveryone || false;
  }

  /**
   * Set the Discord webhook URL to send notifications to
   * @param url Discord webhook URL
   */
  setWebhook(url: string): void {
    this.webhookUrl = url;
  }

  /**
   * Start monitoring the YouTube channel for new videos
   */
  startMonitoring(): void {
    if (this.intervalId) {
      throw new Error('Already monitoring this channel');
    }

    // Do an initial check to get the current videos
    this.checkForNewVideos(true);

    // Set up the interval
    this.intervalId = setInterval(() => {
      this.checkForNewVideos(false);
    }, this.checkInterval);

    console.log(`Started monitoring YouTube channel ${this.channelId} every ${this.checkInterval / 1000} seconds`);
  }

  /**
   * Stop monitoring the YouTube channel
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log(`Stopped monitoring YouTube channel ${this.channelId}`);
    }
  }

  /**
   * Check for new videos on the channel
   * @param initialCheck Whether this is the initial check (will not send notifications)
   */
  private async checkForNewVideos(initialCheck: boolean): Promise<void> {
    try {
      const videos = await this.fetchLatestVideos();
      const newVideos = videos.filter(video => !this.lastCheckedVideos.has(video.videoId));

      // Update the set of checked videos
      videos.forEach(video => this.lastCheckedVideos.add(video.videoId));

      // Don't send notifications on the initial check
      if (!initialCheck && newVideos.length > 0) {
        for (const video of newVideos) {
          await this.sendNotification(video);
        }
      }
    } catch (error) {
      console.error('Error checking for new videos:', error);
    }
  }

  /**
   * Fetch the latest videos from the YouTube channel
   */
  private async fetchLatestVideos(): Promise<YouTubeVideo[]> {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      channelId: this.channelId,
      maxResults: this.maxResults,
      order: 'date',
      type: 'video',
      key: this.apiKey
    };

    const response = await axios.get<YouTubeSearchResponse>(url, { params });
    
    if (!response.data.items) {
      return [];
    }

    return response.data.items.map((item: YouTubeSearchItem) => {
      // Type-safe property access with proper validation
      const videoId = item.id?.videoId;
      const snippet = item.snippet;
      
      if (!videoId || !snippet) {
        throw new Error('Invalid YouTube API response structure');
      }

      return {
        videoId,
        title: snippet.title || 'Untitled',
        channelId: snippet.channelId || this.channelId,
        channelTitle: snippet.channelTitle || 'Unknown Channel',
        publishedAt: snippet.publishedAt || new Date().toISOString(),
        description: snippet.description || '',
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || ''
      };
    });
  }

  /**
   * Send a notification about a new video to the Discord webhook
   * @param video Video details
   */
  private async sendNotification(video: YouTubeVideo): Promise<void> {
    if (!this.webhookUrl) {
      console.warn('No webhook URL set, cannot send notification');
      return;
    }

    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    
    const payload = {
      content: this.mentionEveryone ? '@everyone New video uploaded!' : 'New video uploaded!',
      embeds: [
        {
          title: video.title,
          url: videoUrl,
          color: 16711680, // Red color
          description: this.includeDescription ? video.description : `New video by ${video.channelTitle}`,
          thumbnail: {
            url: video.thumbnailUrl
          },
          fields: [
            {
              name: 'Channel',
              value: video.channelTitle,
              inline: true
            },
            {
              name: 'Published',
              value: new Date(video.publishedAt).toLocaleString(),
              inline: true
            }
          ]
        }
      ]
    };

    try {
      await axios.post(this.webhookUrl, payload);
      console.log(`Sent notification for new video: ${video.title}`);
    } catch (error) {
      console.error('Error sending Discord notification:', error);
    }
  }

  /**
   * Manually check for new videos and send notifications for any found
   */
  async manualCheck(): Promise<YouTubeVideo[]> {
    try {
      const videos = await this.fetchLatestVideos();
      const newVideos = videos.filter(video => !this.lastCheckedVideos.has(video.videoId));
      
      // Update the set of checked videos
      videos.forEach(video => this.lastCheckedVideos.add(video.videoId));
      
      // Send notifications for new videos
      for (const video of newVideos) {
        await this.sendNotification(video);
      }
      
      return newVideos;
    } catch (error) {
      console.error('Error during manual check:', error);
      return [];
    }
  }
}