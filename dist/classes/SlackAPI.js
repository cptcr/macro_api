"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Production-ready Slack API wrapper for team communication & workflow automation
 */
class SlackAPI {
    constructor(config) {
        this.baseUrl = 'https://slack.com/api';
        if (!config.botToken) {
            throw new Error('Slack bot token is required');
        }
        this.botToken = config.botToken;
        this.appToken = config.appToken;
        this.signingSecret = config.signingSecret;
    }
    async request(method, endpoint, data, headers) {
        try {
            const defaultHeaders = {
                'Authorization': `Bearer ${this.botToken}`,
                'Content-Type': method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded'
            };
            const requestHeaders = { ...defaultHeaders, ...headers };
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}/${endpoint}`,
                data: method === 'POST' ? data : undefined,
                params: method === 'GET' ? data : undefined,
                headers: requestHeaders,
                timeout: 30000
            });
            const result = response.data;
            if (!result.ok) {
                throw new Error(`Slack API Error: ${result.error || 'Unknown error'}`);
            }
            return response.data;
        }
        catch (error) {
            this.handleSlackError(error);
            throw error;
        }
    }
    handleSlackError(error) {
        if (error.response?.data?.error) {
            const slackError = error.response.data.error;
            throw new Error(`Slack API Error: ${slackError}`);
        }
    }
    /**
     * Send a message to a channel or user
     */
    async sendMessage(channel, text, options) {
        const data = {
            channel,
            text
        };
        if (options?.blocks)
            data.blocks = JSON.stringify(options.blocks);
        if (options?.threadTs)
            data.thread_ts = options.threadTs;
        if (options?.unfurlLinks !== undefined)
            data.unfurl_links = options.unfurlLinks;
        if (options?.unfurlMedia !== undefined)
            data.unfurl_media = options.unfurlMedia;
        if (options?.asUser !== undefined)
            data.as_user = options.asUser;
        return this.request('POST', 'chat.postMessage', data);
    }
    /**
     * Upload a file to Slack
     */
    async uploadFile(channels, file, options) {
        const formData = new FormData();
        if (typeof file === 'string') {
            formData.append('content', file);
        }
        else {
            formData.append('file', new Blob([file]), options?.filename || 'file');
        }
        formData.append('channels', Array.isArray(channels) ? channels.join(',') : channels);
        if (options?.filename)
            formData.append('filename', options.filename);
        if (options?.title)
            formData.append('title', options.title);
        if (options?.filetype)
            formData.append('filetype', options.filetype);
        if (options?.initialComment)
            formData.append('initial_comment', options.initialComment);
        if (options?.threadTs)
            formData.append('thread_ts', options.threadTs);
        return this.request('POST', 'files.upload', formData, {
            'Content-Type': 'multipart/form-data'
        });
    }
    /**
     * Create a new channel
     */
    async createChannel(name, options) {
        // Remove invalid characters and convert to lowercase
        const channelName = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        const data = {
            name: channelName
        };
        if (options?.isPrivate)
            data.is_private = options.isPrivate;
        const response = await this.request('POST', 'conversations.create', data);
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
    async setChannelTopic(channel, topic) {
        await this.request('POST', 'conversations.setTopic', {
            channel,
            topic
        });
    }
    /**
     * Set channel purpose
     */
    async setChannelPurpose(channel, purpose) {
        await this.request('POST', 'conversations.setPurpose', {
            channel,
            purpose
        });
    }
    /**
     * Get user information
     */
    async getUserInfo(userId) {
        const response = await this.request('GET', 'users.info', {
            user: userId
        });
        return response.user;
    }
    /**
     * Set a reminder
     */
    async setReminder(text, time, user) {
        const data = {
            text,
            time
        };
        if (user)
            data.user = user;
        const response = await this.request('POST', 'reminders.add', data);
        return response.reminder;
    }
    /**
     * Search messages
     */
    async searchMessages(query, options) {
        const data = {
            query
        };
        if (options?.count)
            data.count = options.count;
        if (options?.highlight !== undefined)
            data.highlight = options.highlight;
        if (options?.page)
            data.page = options.page;
        if (options?.sortDir)
            data.sort_dir = options.sortDir;
        return this.request('GET', 'search.messages', data);
    }
    /**
     * Handle slash command with signature verification
     */
    async handleSlashCommand(payload, signature, timestamp, rawBody) {
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
    verifySlackSignature(signature, timestamp, body) {
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
        const expectedSignature = 'v0=' + crypto_1.default
            .createHmac('sha256', this.signingSecret)
            .update(sigBasestring)
            .digest('hex');
        // Use timingSafeEqual to prevent timing attacks
        if (!crypto_1.default.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))) {
            throw new Error('Invalid signature');
        }
    }
    /**
     * Process slash command
     */
    async processSlashCommand(payload) {
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
    async getChannels(excludeArchived = true) {
        const data = {
            exclude_archived: excludeArchived,
            types: 'public_channel,private_channel'
        };
        const response = await this.request('GET', 'conversations.list', data);
        return response.channels;
    }
    /**
     * Join a channel
     */
    async joinChannel(channel) {
        await this.request('POST', 'conversations.join', { channel });
    }
    /**
     * Leave a channel
     */
    async leaveChannel(channel) {
        await this.request('POST', 'conversations.leave', { channel });
    }
    /**
     * Invite users to a channel
     */
    async inviteUsersToChannel(channel, users) {
        await this.request('POST', 'conversations.invite', {
            channel,
            users: users.join(',')
        });
    }
    /**
     * Get channel members
     */
    async getChannelMembers(channel) {
        const response = await this.request('GET', 'conversations.members', {
            channel
        });
        return response.members;
    }
    /**
     * Archive a channel
     */
    async archiveChannel(channel) {
        await this.request('POST', 'conversations.archive', { channel });
    }
    /**
     * Unarchive a channel
     */
    async unarchiveChannel(channel) {
        await this.request('POST', 'conversations.unarchive', { channel });
    }
    /**
     * Update a message
     */
    async updateMessage(channel, ts, text, blocks) {
        const data = {
            channel,
            ts,
            text
        };
        if (blocks)
            data.blocks = JSON.stringify(blocks);
        return this.request('POST', 'chat.update', data);
    }
    /**
     * Delete a message
     */
    async deleteMessage(channel, ts) {
        await this.request('POST', 'chat.delete', {
            channel,
            ts
        });
    }
    /**
     * Add reaction to a message
     */
    async addReaction(channel, timestamp, name) {
        await this.request('POST', 'reactions.add', {
            channel,
            timestamp,
            name
        });
    }
    /**
     * Remove reaction from a message
     */
    async removeReaction(channel, timestamp, name) {
        await this.request('POST', 'reactions.remove', {
            channel,
            timestamp,
            name
        });
    }
    /**
     * Get team information
     */
    async getTeamInfo() {
        const response = await this.request('GET', 'team.info');
        return response.team;
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            await this.request('GET', 'api.test');
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.SlackAPI = SlackAPI;
