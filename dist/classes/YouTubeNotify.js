"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeNotify = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * YouTube notification system that monitors channels and sends notifications to Discord via webhooks
 */
class YouTubeNotify {
    /**
     * Create a new YouTube notification system
     * @param options Configuration options
     */
    constructor(options) {
        this.webhookUrl = null;
        this.intervalId = null;
        this.lastCheckedVideos = new Set();
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
    setWebhook(url) {
        this.webhookUrl = url;
    }
    /**
     * Start monitoring the YouTube channel for new videos
     */
    startMonitoring() {
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
    stopMonitoring() {
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
    async checkForNewVideos(initialCheck) {
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
        }
        catch (error) {
            console.error('Error checking for new videos:', error);
        }
    }
    /**
     * Fetch the latest videos from the YouTube channel
     */
    async fetchLatestVideos() {
        const url = 'https://www.googleapis.com/youtube/v3/search';
        const params = {
            part: 'snippet',
            channelId: this.channelId,
            maxResults: this.maxResults,
            order: 'date',
            type: 'video',
            key: this.apiKey
        };
        const response = await axios_1.default.get(url, { params });
        if (!response.data.items) {
            return [];
        }
        return response.data.items.map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
        }));
    }
    /**
     * Send a notification about a new video to the Discord webhook
     * @param video Video details
     */
    async sendNotification(video) {
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
            await axios_1.default.post(this.webhookUrl, payload);
            console.log(`Sent notification for new video: ${video.title}`);
        }
        catch (error) {
            console.error('Error sending Discord notification:', error);
        }
    }
    /**
     * Manually check for new videos and send notifications for any found
     */
    async manualCheck() {
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
        }
        catch (error) {
            console.error('Error during manual check:', error);
            return [];
        }
    }
}
exports.YouTubeNotify = YouTubeNotify;
