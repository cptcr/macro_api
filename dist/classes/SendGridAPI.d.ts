export interface SendGridConfig {
    apiKey: string;
    defaultFromEmail?: string;
    defaultFromName?: string;
}
export interface EmailOptions {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    text?: string;
    html?: string;
    templateId?: string;
    dynamicTemplateData?: Record<string, any>;
    attachments?: Attachment[];
    customArgs?: Record<string, string>;
    headers?: Record<string, string>;
    categories?: string[];
    sendAt?: number;
    batchId?: string;
    asm?: {
        groupId: number;
        groupsToDisplay?: number[];
    };
    trackingSettings?: {
        clickTracking?: {
            enable: boolean;
            enableText?: boolean;
        };
        openTracking?: {
            enable: boolean;
            substitutionTag?: string;
        };
        subscriptionTracking?: {
            enable: boolean;
            text?: string;
            html?: string;
            substitutionTag?: string;
        };
        ganalytics?: {
            enable: boolean;
            utmSource?: string;
            utmMedium?: string;
            utmTerm?: string;
            utmContent?: string;
            utmCampaign?: string;
        };
    };
    mailSettings?: {
        bypassListManagement?: {
            enable: boolean;
        };
        footer?: {
            enable: boolean;
            text?: string;
            html?: string;
        };
        sandboxMode?: {
            enable: boolean;
        };
        spamCheck?: {
            enable: boolean;
            threshold?: number;
            postToUrl?: string;
        };
    };
}
export interface Attachment {
    content: string;
    filename: string;
    type?: string;
    disposition?: 'attachment' | 'inline';
    contentId?: string;
}
export interface Recipient {
    email: string;
    name?: string;
    substitutions?: Record<string, string>;
    customArgs?: Record<string, string>;
}
export interface Template {
    id: string;
    name: string;
    generation: 'legacy' | 'dynamic';
    updatedAt: string;
    versions: TemplateVersion[];
}
export interface TemplateVersion {
    id: string;
    templateId: string;
    active: number;
    name: string;
    htmlContent: string;
    plainContent: string;
    generatePlainContent: boolean;
    subject: string;
    updatedAt: string;
    editorType: 'code' | 'design';
    testData: string;
}
export interface Contact {
    id?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    alternateEmails?: string[];
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateProvinceRegion?: string;
    postalCode?: string;
    country?: string;
    phoneNumber?: string;
    whatsapp?: string;
    line?: string;
    facebook?: string;
    uniqueName?: string;
    customFields?: Record<string, any>;
}
export interface List {
    id: string;
    name: string;
    contactCount: number;
    createdAt: string;
    updatedAt: string;
}
export interface ListResponse {
    result: List[];
    contactCount: number;
}
export interface EmailResponse {
    messageId: string;
}
export interface EmailStats {
    date: string;
    stats: Array<{
        metrics: {
            blocks: number;
            bounceDrops: number;
            bounces: number;
            clicks: number;
            deferred: number;
            delivered: number;
            invalidEmails: number;
            opens: number;
            processed: number;
            requests: number;
            spamReportDrops: number;
            spamReports: number;
            uniqueClicks: number;
            uniqueOpens: number;
            unsubscribeDrops: number;
            unsubscribes: number;
        };
    }>;
}
export interface ValidationResult {
    email: string;
    verdict: 'Valid' | 'Risky' | 'Invalid';
    score: number;
    local: string;
    host: string;
    suggestion?: string;
    checks: {
        domain: {
            hasValidAddressStructure: boolean;
            hasValidDomainStructure: boolean;
            isNotDisposableEmail: boolean;
            isNotSuspectedRole: boolean;
        };
        localPart: {
            isValidFormat: boolean;
            isNotSuspectedRole: boolean;
        };
        additional: {
            hasKnownTld: boolean;
            hasValidDomainStructure: boolean;
        };
    };
    source: string;
    ipAddress: string;
}
export interface ScheduledEmail {
    batchId: string;
    status: 'pending' | 'paused' | 'cancelled';
}
/**
 * Production-ready SendGrid API wrapper for transactional email delivery
 */
export declare class SendGridAPI {
    private readonly apiKey;
    private readonly defaultFromEmail?;
    private readonly defaultFromName?;
    private readonly baseUrl;
    constructor(config: SendGridConfig);
    private request;
    private handleSendGridError;
    private formatEmailAddress;
    private formatEmailAddresses;
    /**
     * Send a single email
     */
    sendEmail(options: EmailOptions): Promise<EmailResponse>;
    /**
     * Send template email to multiple recipients with personalization
     */
    sendTemplateEmail(templateId: string, recipients: Recipient[], globalTemplateData?: Record<string, any>): Promise<EmailResponse>;
    /**
     * Create a new email template
     */
    createTemplate(name: string, generation?: 'legacy' | 'dynamic'): Promise<Template>;
    /**
     * Get template by ID
     */
    getTemplate(templateId: string): Promise<Template>;
    /**
     * Update template
     */
    updateTemplate(templateId: string, name: string): Promise<Template>;
    /**
     * Delete template
     */
    deleteTemplate(templateId: string): Promise<void>;
    /**
     * Create template version
     */
    createTemplateVersion(templateId: string, name: string, subject: string, htmlContent: string, plainContent?: string): Promise<TemplateVersion>;
    /**
     * Add contacts to a list
     */
    addToList(listId: string, contacts: Contact[]): Promise<any>;
    /**
     * Create a new contact list
     */
    createList(name: string): Promise<List>;
    /**
     * Get all contact lists
     */
    getLists(): Promise<ListResponse>;
    /**
     * Delete a contact list
     */
    deleteList(listId: string, deleteContacts?: boolean): Promise<void>;
    /**
     * Get email statistics for date range
     */
    getEmailStats(startDate: string, endDate?: string, aggregatedBy?: 'day' | 'week' | 'month'): Promise<EmailStats[]>;
    /**
     * Validate email address
     */
    validateEmail(email: string): Promise<ValidationResult>;
    /**
     * Schedule email for future delivery
     */
    scheduleEmail(options: EmailOptions, sendAt: Date): Promise<ScheduledEmail>;
    /**
     * Cancel scheduled email
     */
    cancelScheduledEmail(batchId: string): Promise<void>;
    /**
     * Pause scheduled email
     */
    pauseScheduledEmail(batchId: string): Promise<void>;
    /**
     * Resume scheduled email
     */
    resumeScheduledEmail(batchId: string): Promise<void>;
    /**
     * Get scheduled email status
     */
    getScheduledEmailStatus(batchId: string): Promise<ScheduledEmail>;
    /**
     * Suppress an email address (add to suppression list)
     */
    suppressEmail(email: string, groupId: number): Promise<void>;
    /**
     * Remove email from suppression list
     */
    unsuppressEmail(email: string, groupId: number): Promise<void>;
    /**
     * Get suppression groups
     */
    getSuppressionGroups(): Promise<any[]>;
    /**
     * Validate email format
     */
    private isValidEmailFormat;
    /**
     * Generate unique batch ID
     */
    private generateBatchId;
    /**
     * Test API connection
     */
    testConnection(): Promise<boolean>;
}
