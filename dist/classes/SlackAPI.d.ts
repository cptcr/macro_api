/// <reference types="node" />
/// <reference types="node" />
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
    attachments?: any[];
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
        statusEmojiDisplayInfo: any[];
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
        matches: any[];
    };
}
/**
 * Production-ready Slack API wrapper for team communication & workflow automation
 */
export declare class SlackAPI {
    private readonly botToken;
    private readonly appToken?;
    private readonly signingSecret?;
    private readonly baseUrl;
    constructor(config: SlackConfig);
    private request;
    private handleSlackError;
    /**
     * Send a message to a channel or user
     */
    sendMessage(channel: string, text: string, options?: MessageOptions): Promise<MessageResponse>;
    /**
     * Upload a file to Slack
     */
    uploadFile(channels: string | string[], file: Buffer | string, options?: FileOptions): Promise<FileResponse>;
    /**
     * Create a new channel
     */
    createChannel(name: string, options?: ChannelOptions): Promise<Channel>;
    /**
     * Set channel topic
     */
    setChannelTopic(channel: string, topic: string): Promise<void>;
    /**
     * Set channel purpose
     */
    setChannelPurpose(channel: string, purpose: string): Promise<void>;
    /**
     * Get user information
     */
    getUserInfo(userId: string): Promise<User>;
    /**
     * Set a reminder
     */
    setReminder(text: string, time: string, user?: string): Promise<Reminder>;
    /**
     * Search messages
     */
    searchMessages(query: string, options?: SearchOptions): Promise<SearchResults>;
    /**
     * Handle slash command with signature verification
     */
    handleSlashCommand(payload: SlashCommandPayload, signature?: string, timestamp?: string, rawBody?: string): Promise<CommandResponse>;
    /**
     * Verify Slack request signature
     */
    private verifySlackSignature;
    /**
     * Process slash command
     */
    private processSlashCommand;
    /**
     * Get channel list
     */
    getChannels(excludeArchived?: boolean): Promise<Channel[]>;
    /**
     * Join a channel
     */
    joinChannel(channel: string): Promise<void>;
    /**
     * Leave a channel
     */
    leaveChannel(channel: string): Promise<void>;
    /**
     * Invite users to a channel
     */
    inviteUsersToChannel(channel: string, users: string[]): Promise<void>;
    /**
     * Get channel members
     */
    getChannelMembers(channel: string): Promise<string[]>;
    /**
     * Archive a channel
     */
    archiveChannel(channel: string): Promise<void>;
    /**
     * Unarchive a channel
     */
    unarchiveChannel(channel: string): Promise<void>;
    /**
     * Update a message
     */
    updateMessage(channel: string, ts: string, text: string, blocks?: Block[]): Promise<MessageResponse>;
    /**
     * Delete a message
     */
    deleteMessage(channel: string, ts: string): Promise<void>;
    /**
     * Add reaction to a message
     */
    addReaction(channel: string, timestamp: string, name: string): Promise<void>;
    /**
     * Remove reaction from a message
     */
    removeReaction(channel: string, timestamp: string, name: string): Promise<void>;
    /**
     * Get team information
     */
    getTeamInfo(): Promise<any>;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
}
