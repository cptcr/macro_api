import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { handleAxiosError, toString, getProperty, toRequestData } from '../utils/errorHandling';

export interface SlackConfig {
  botToken: string;
  appToken?: string;
  signingSecret?: string;
}

export interface MessageOptions {
  blocks?: Block[];
  threadTs?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
  asUser?: boolean;
}

export interface Block {
  type: string;
  [key: string]: any;
}

export interface FileOptions {
  filename?: string;
  title?: string;
  filetype?: string;
  initialComment?: string;
  threadTs?: string;
}

export interface ChannelOptions {
  isPrivate?: boolean;
  topic?: string;
  purpose?: string;
}

export interface SearchOptions {
  count?: number;
  highlight?: boolean;
  page?: number;
  sortDir?: 'asc' | 'desc';
}

export interface SlashCommandPayload {
  token: string;
  teamId: string;
  teamDomain: string;
  channelId: string;
  channelName: string;
  userId: string;
  userName: string;
  command: string;
  text: string;
  responseUrl: string;
  triggerId: string;
}

export interface CommandResponse {
  responseType?: 'in_channel' | 'ephemeral';
  text?: string;
  blocks?: Block[];
  attachments?: Record<string, unknown>[];
}

export interface MessageResponse {
  ok: boolean;
  channel: string;
  ts: string;
  message: {
    type: string;
    subtype?: string;
    text: string;
    ts: string;
    username?: string;
    botId?: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  isChannel: boolean;
  isGroup: boolean;
  isIm: boolean;
  created: number;
  isArchived: boolean;
  isGeneral: boolean;
  unlinked: number;
  nameNormalized: string;
  isShared: boolean;
  parentConversation?: string;
  creator: string;
  isExtShared: boolean;
  isOrgShared: boolean;
  sharedTeamIds: string[];
  pendingShared: string[];
  pendingConnectedTeamIds: string[];
  isPendingExtShared: boolean;
  isMember: boolean;
  isPrivate: boolean;
  isMpim: boolean;
  topic: {
    value: string;
    creator: string;
    lastSet: number;
  };
  purpose: {
    value: string;
    creator: string;
    lastSet: number;
  };
  previousNames: string[];
  numMembers: number;
}

export interface User {
  id: string;
  teamId: string;
  name: string;
  deleted: boolean;
  color: string;
  realName: string;
  tz: string;
  tzLabel: string;
  tzOffset: number;
  profile: {
    title: string;
    phone: string;
    skype: string;
    realName: string;
    realNameNormalized: string;
    displayName: string;
    displayNameNormalized: string;
    fields: any;
    statusText: string;
    statusEmoji: string;
    statusEmojiDisplayInfo: Record<string, unknown>[];
    statusExpiration: number;
    avatarHash: string;
    imageOriginal?: string;
    isCustomImage?: boolean;
    email?: string;
    firstName?: string;
    lastName?: string;
    image24: string;
    image32: string;
    image48: string;
    image72: string;
    image192: string;
    image512: string;
    image1024?: string;
    statusTextCanonical?: string;
    team: string;
  };
  isAdmin: boolean;
  isOwner: boolean;
  isPrimaryOwner: boolean;
  isRestricted: boolean;
  isUltraRestricted: boolean;
  isBot: boolean;
  isStranger?: boolean;
  updated: number;
  isAppUser: boolean;
  isInvitedUser?: boolean;
  has2fa?: boolean;
  locale?: string;
}

export interface Reminder {
  id: string;
  creator: string;
  user: string;
  text: string;
  recurring: boolean;
  time: number;
  completeTs: number;
}

export interface FileResponse {
  ok: boolean;
  file: {
    id: string;
    created: number;
    timestamp: number;
    name: string;
    title: string;
    mimetype: string;
    filetype: string;
    prettyType: string;
    user: string;
    editable: boolean;
    size: number;
    mode: string;
    isExternal: boolean;
    externalType: string;
    isPublic: boolean;
    publicUrlShared: boolean;
    displayAsBot: boolean;
    username: string;
    urlPrivate: string;
    urlPrivateDownload: string;
    permalink: string;
    permalinkPublic?: string;
    hasRichPreview: boolean;
  };
}

export interface SearchResults {
  query: string;
  messages: {
    total: number;
    pagination: {
      totalCount: number;
      page: number;
      perPage: number;
      pageCount: number;
      first: number;
      last: number;
    };
    paging: {
      count: number;
      total: number;
      page: number;
      pages: number;
    };
    matches: Record<string, unknown>[];
  };
}

/**
 * Production-ready Slack API wrapper for team communication & workflow automation
 */
export class SlackAPI {
  private readonly botToken: string;
  private readonly appToken?: string;
  private readonly signingSecret?: string;
  private readonly baseUrl = 'https://slack.com/api';

  constructor(config: SlackConfig) {
    if (!config.botToken) {
      throw new Error('Slack bot token is required');
    }
    
    this.botToken = config.botToken;
    this.appToken = config.appToken;
    this.signingSecret = config.signingSecret;
  }

  private async request<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: Record<string, unknown> | FormData,
    headers?: Record<string, string>
  ): Promise<T> {
    try {
      const defaultHeaders = {
        'Authorization': `Bearer ${this.botToken}`,
        'Content-Type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded'
      };

      const requestHeaders = { ...defaultHeaders, ...headers };

      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseUrl}/${endpoint}`,
        data: method === 'POST' ? data : undefined,
        params: method === 'GET' ? data : undefined,
        headers: requestHeaders,
        timeout: 30000
      });

      const result = response.data as Record<string, unknown>;
      
      if (!getProperty(result, 'ok')) {
        const errorMsg = toString(getProperty(result, 'error')) || 'Unknown error';
        throw new Error(`Slack API Error: ${errorMsg}`);
      }

      return response.data;
    } catch (error: unknown) {
      this.handleSlackError(error);
      throw error;
    }
  }

  private handleSlackError(error: unknown): void {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as Record<string, unknown>;
      const slackError = getProperty(errorData, 'error');
      throw new Error(`Slack API Error: ${toString(slackError)}`);
    }
    
    handleAxiosError(error, 'Slack');
  }

  /**
   * Send a message to a channel or user
   */
  async sendMessage(
    channel: string, 
    text: string, 
    options?: MessageOptions
  ): Promise<MessageResponse> {
    const data: Record<string, unknown> = {
      channel,
      text
    };

    if (options?.blocks) data.blocks = JSON.stringify(options.blocks);
    if (options?.threadTs) data.thread_ts = options.threadTs;
    if (options?.unfurlLinks !== undefined) data.unfurl_links = options.unfurlLinks;
    if (options?.unfurlMedia !== undefined) data.unfurl_media = options.unfurlMedia;
    if (options?.asUser !== undefined) data.as_user = options.asUser;

    return this.request<MessageResponse>('POST', 'chat.postMessage', data);
  }

  /**
   * Upload a file to Slack
   */
  async uploadFile(
    channels: string | string[],
    file: Buffer | string,
    options?: FileOptions
  ): Promise<FileResponse> {
    const formData = toRequestData({
      channels: Array.isArray(channels) ? channels.join(',') : channels,
      content: typeof file === 'string' ? file : file.toString('base64'),
      filename: options?.filename,
      title: options?.title,
      filetype: options?.filetype,
      initial_comment: options?.initialComment,
      thread_ts: options?.threadTs
    });

    return this.request<FileResponse>('POST', 'files.upload', formData, {
      'Content-Type': 'multipart/form-data'
    });
  }

  /**
   * Create a new channel
   */
  async createChannel(name: string, options?: ChannelOptions): Promise<Channel> {
    // Remove invalid characters and convert to lowercase
    const channelName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    
    const data: Record<string, unknown> = {
      name: channelName
    };

    if (options?.isPrivate) data.is_private = options.isPrivate;

    const response = await this.request<{ channel: Channel }>('POST', 'conversations.create', data);
    
    // Set topic and purpose if provided
    if (options?.topic) {
      await this.setChannelTopic(response.channel.id, options.topic);
    }
    
    if (options?.purpose) {
      await this.setChannelPurpose(response.channel.id, options.purpose);
    }

    return response.channel;
  }

  /**
   * Set channel topic
   */
  async setChannelTopic(channel: string, topic: string): Promise<void> {
    await this.request('POST', 'conversations.setTopic', {
      channel,
      topic
    });
  }

  /**
   * Set channel purpose
   */
  async setChannelPurpose(channel: string, purpose: string): Promise<void> {
    await this.request('POST', 'conversations.setPurpose', {
      channel,
      purpose
    });
  }

  /**
   * Get user information
   */
  async getUserInfo(userId: string): Promise<User> {
    const response = await this.request<{ user: User }>('GET', 'users.info', {
      user: userId
    });
    
    return response.user;
  }

  /**
   * Set a reminder
   */
  async setReminder(text: string, time: string, user?: string): Promise<Reminder> {
    const data: Record<string, unknown> = {
      text,
      time
    };

    if (user) data.user = user;

    const response = await this.request<{ reminder: Reminder }>('POST', 'reminders.add', data);
    return response.reminder;
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, options?: SearchOptions): Promise<SearchResults> {
    const data: Record<string, unknown> = {
      query
    };

    if (options?.count) data.count = options.count;
    if (options?.highlight !== undefined) data.highlight = options.highlight;
    if (options?.page) data.page = options.page;
    if (options?.sortDir) data.sort_dir = options.sortDir;

    return this.request<SearchResults>('GET', 'search.messages', data);
  }

  /**
   * Handle slash command with signature verification
   */
  async handleSlashCommand(
    payload: SlashCommandPayload,
    signature?: string,
    timestamp?: string,
    rawBody?: string
  ): Promise<CommandResponse> {
    // Verify signature if signing secret is available
    if (this.signingSecret && signature && timestamp && rawBody) {
      this.verifySlackSignature(signature, timestamp, rawBody);
    }

    // Process the command based on the command type
    return this.processSlashCommand(payload);
  }

  /**
   * Verify Slack request signature
   */
  private verifySlackSignature(signature: string, timestamp: string, body: string): void {
    if (!this.signingSecret) {
      throw new Error('Signing secret is required for signature verification');
    }

    const time = parseInt(timestamp);
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the timestamp is too old (more than 5 minutes)
    if (Math.abs(currentTime - time) > 300) {
      throw new Error('Request timestamp is too old');
    }

    // Create the signature
    const sigBasestring = `v0:${timestamp}:${body}`;
    const expectedSignature = 'v0=' + crypto
      .createHmac('sha256', this.signingSecret)
      .update(sigBasestring)
      .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )) {
      throw new Error('Invalid signature');
    }
  }

  /**
   * Process slash command
   */
  private async processSlashCommand(payload: SlashCommandPayload): Promise<CommandResponse> {
    // This is a basic implementation - extend based on your needs
    const { command, text, channelId, userId } = payload;

    switch (command) {
      case '/help':
        return {
          responseType: 'ephemeral',
          text: 'Available commands: /help, /status',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Available Commands:*\n• `/help` - Show this help message\n• `/status` - Check system status'
              }
            }
          ]
        };

      case '/status':
        return {
          responseType: 'in_channel',
          text: 'System status: All systems operational',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: ':white_check_mark: *System Status:* All systems operational'
              }
            }
          ]
        };

      default:
        return {
          responseType: 'ephemeral',
          text: `Unknown command: ${command}. Type \`/help\` for available commands.`
        };
    }
  }

  /**
   * Get channel list
   */
  async getChannels(excludeArchived: boolean = true): Promise<Channel[]> {
    const data: Record<string, unknown> = {
      exclude_archived: excludeArchived,
      types: 'public_channel,private_channel'
    };

    const response = await this.request<{ channels: Channel[] }>('GET', 'conversations.list', data);
    return response.channels;
  }

  /**
   * Join a channel
   */
  async joinChannel(channel: string): Promise<void> {
    await this.request('POST', 'conversations.join', { channel });
  }

  /**
   * Leave a channel
   */
  async leaveChannel(channel: string): Promise<void> {
    await this.request('POST', 'conversations.leave', { channel });
  }

  /**
   * Invite users to a channel
   */
  async inviteUsersToChannel(channel: string, users: string[]): Promise<void> {
    await this.request('POST', 'conversations.invite', {
      channel,
      users: users.join(',')
    });
  }

  /**
   * Get channel members
   */
  async getChannelMembers(channel: string): Promise<string[]> {
    const response = await this.request<{ members: string[] }>('GET', 'conversations.members', {
      channel
    });
    return response.members;
  }

  /**
   * Archive a channel
   */
  async archiveChannel(channel: string): Promise<void> {
    await this.request('POST', 'conversations.archive', { channel });
  }

  /**
   * Unarchive a channel
   */
  async unarchiveChannel(channel: string): Promise<void> {
    await this.request('POST', 'conversations.unarchive', { channel });
  }

  /**
   * Update a message
   */
  async updateMessage(channel: string, ts: string, text: string, blocks?: Block[]): Promise<MessageResponse> {
    const data: Record<string, unknown> = {
      channel,
      ts,
      text
    };

    if (blocks) data.blocks = JSON.stringify(blocks);

    return this.request<MessageResponse>('POST', 'chat.update', data);
  }

  /**
   * Delete a message
   */
  async deleteMessage(channel: string, ts: string): Promise<void> {
    await this.request('POST', 'chat.delete', {
      channel,
      ts
    });
  }

  /**
   * Add reaction to a message
   */
  async addReaction(channel: string, timestamp: string, name: string): Promise<void> {
    await this.request('POST', 'reactions.add', {
      channel,
      timestamp,
      name
    });
  }

  /**
   * Remove reaction from a message
   */
  async removeReaction(channel: string, timestamp: string, name: string): Promise<void> {
    await this.request('POST', 'reactions.remove', {
      channel,
      timestamp,
      name
    });
  }

  /**
   * Get team information
   */
  async getTeamInfo(): Promise<Record<string, unknown>> {
    const response = await this.request<{ team: any }>('GET', 'team.info');
    return response.team;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('GET', 'api.test');
      return true;
    } catch (error) {
      return false;
    }
  }
}