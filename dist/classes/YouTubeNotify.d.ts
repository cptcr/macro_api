import NotificationOptions from '../interfaces/YouTube/NotificationOptions';
import YouTubeVideo from '../interfaces/YouTube/YouTubeVideo';
/**
 * YouTube notification system that monitors channels and sends notifications to Discord via webhooks
 */
export declare class YouTubeNotify {
    private channelId;
    private apiKey;
    private webhookUrl;
    private checkInterval;
    private intervalId;
    private lastCheckedVideos;
    private maxResults;
    private includeDescription;
    private mentionEveryone;
    /**
     * Create a new YouTube notification system
     * @param options Configuration options
     */
    constructor(options: NotificationOptions);
    /**
     * Set the Discord webhook URL to send notifications to
     * @param url Discord webhook URL
     */
    setWebhook(url: string): void;
    /**
     * Start monitoring the YouTube channel for new videos
     */
    startMonitoring(): void;
    /**
     * Stop monitoring the YouTube channel
     */
    stopMonitoring(): void;
    /**
     * Check for new videos on the channel
     * @param initialCheck Whether this is the initial check (will not send notifications)
     */
    private checkForNewVideos;
    /**
     * Fetch the latest videos from the YouTube channel
     */
    private fetchLatestVideos;
    /**
     * Send a notification about a new video to the Discord webhook
     * @param video Video details
     */
    private sendNotification;
    /**
     * Manually check for new videos and send notifications for any found
     */
    manualCheck(): Promise<YouTubeVideo[]>;
}
