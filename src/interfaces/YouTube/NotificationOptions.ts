export default interface NotificationOptions {
    channelId: string;
    apiKey: string;
    checkIntervalMs?: number;
    maxResults?: number;
    includeDescription?: boolean;
    mentionEveryone?: boolean;
  }

