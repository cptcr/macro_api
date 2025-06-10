import axios, { AxiosResponse } from 'axios';
import { handleAxiosError, toString, getProperty } from '../utils/errorHandling';

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
  dynamicTemplateData?: Record<string, unknown>;
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
    clickTracking?: { enable: boolean; enableText?: boolean };
    openTracking?: { enable: boolean; substitutionTag?: string };
    subscriptionTracking?: { enable: boolean; text?: string; html?: string; substitutionTag?: string };
    ganalytics?: { enable: boolean; utmSource?: string; utmMedium?: string; utmTerm?: string; utmContent?: string; utmCampaign?: string };
  };
  mailSettings?: {
    bypassListManagement?: { enable: boolean };
    footer?: { enable: boolean; text?: string; html?: string };
    sandboxMode?: { enable: boolean };
    spamCheck?: { enable: boolean; threshold?: number; postToUrl?: string };
  };
}

export interface Attachment {
  content: string; // Base64 encoded content
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
  customFields?: Record<string, unknown>;
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
export class SendGridAPI {
  private readonly apiKey: string;
  private readonly defaultFromEmail?: string;
  private readonly defaultFromName?: string;
  private readonly baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: SendGridConfig) {
    if (!config.apiKey) {
      throw new Error('SendGrid API key is required');
    }
    
    this.apiKey = config.apiKey;
    this.defaultFromEmail = config.defaultFromEmail;
    this.defaultFromName = config.defaultFromName;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown>,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...customHeaders
      };

      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data,
        headers,
        timeout: 30000
      });

      return response.data;
    } catch (error: unknown) {
      this.handleSendGridError(error);
      throw error;
    }
  }

  private handleSendGridError(error: unknown): void {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as Record<string, unknown>;
      const errors = getProperty(errorData, 'errors');
      
      if (Array.isArray(errors)) {
        const errorMessages = errors.map((err: unknown) => {
          if (typeof err === 'object' && err !== null) {
            return toString(getProperty(err, 'message'));
          }
          return toString(err);
        }).join(', ');
        throw new Error(`SendGrid API Error: ${errorMessages}`);
      }
    }
    
    handleAxiosError(error, 'SendGrid');
  }

  private formatEmailAddress(email: string, name?: string): { email: string; name?: string } {
    return name ? { email, name } : { email };
  }

  private formatEmailAddresses(emails: string | string[]): Array<{ email: string }> {
    const emailArray = Array.isArray(emails) ? emails : [emails];
    return emailArray.map(email => ({ email }));
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
      throw new Error('At least one recipient email is required');
    }

    if (!options.subject) {
      throw new Error('Email subject is required');
    }

    if (!options.text && !options.html && !options.templateId) {
      throw new Error('Email content (text, html, or templateId) is required');
    }

    const emailData: Record<string, unknown> = {
      personalizations: [{
        to: this.formatEmailAddresses(options.to)
      }],
      from: this.formatEmailAddress(
        this.defaultFromEmail || 'noreply@example.com',
        this.defaultFromName
      ),
      subject: options.subject
    };

    // Get the personalizations array safely
    const personalizations = emailData.personalizations as Array<Record<string, unknown>>;
    const firstPersonalization = personalizations[0];

    // Add CC and BCC if provided
    if (options.cc) {
      firstPersonalization.cc = this.formatEmailAddresses(options.cc);
    }
    if (options.bcc) {
      firstPersonalization.bcc = this.formatEmailAddresses(options.bcc);
    }

    // Add content
    if (options.templateId) {
      emailData.templateId = options.templateId;
      if (options.dynamicTemplateData) {
        firstPersonalization.dynamicTemplateData = options.dynamicTemplateData;
      }
    } else {
      const content: Array<Record<string, unknown>> = [];
      if (options.text) {
        content.push({
          type: 'text/plain',
          value: options.text
        });
      }
      if (options.html) {
        content.push({
          type: 'text/html',
          value: options.html
        });
      }
      emailData.content = content;
    }

    // Add optional fields
    if (options.attachments) {
      emailData.attachments = options.attachments;
    }
    if (options.customArgs) {
      firstPersonalization.customArgs = options.customArgs;
    }
    if (options.headers) {
      firstPersonalization.headers = options.headers;
    }
    if (options.categories) {
      emailData.categories = options.categories;
    }
    if (options.sendAt) {
      emailData.sendAt = options.sendAt;
    }
    if (options.batchId) {
      emailData.batchId = options.batchId;
    }
    if (options.asm) {
      emailData.asm = options.asm;
    }
    if (options.trackingSettings) {
      emailData.trackingSettings = options.trackingSettings;
    }
    if (options.mailSettings) {
      emailData.mailSettings = options.mailSettings;
    }

    const response = await this.request<Record<string, unknown>>('POST', '/mail/send', emailData);
    
    // SendGrid returns a 202 status with no body for successful sends
    // We need to extract the message ID from the response headers
    return {
      messageId: toString(getProperty(response, 'messageId')) || 'sent'
    };
  }

  /**
   * Send template email to multiple recipients with personalization
   */
  async sendTemplateEmail(
    templateId: string, 
    recipients: Recipient[], 
    globalTemplateData?: Record<string, unknown>
  ): Promise<EmailResponse> {
    if (!templateId) {
      throw new Error('Template ID is required');
    }
    if (!recipients || recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }

    const emailData: Record<string, unknown> = {
      from: this.formatEmailAddress(
        this.defaultFromEmail || 'noreply@example.com',
        this.defaultFromName
      ),
      templateId,
      personalizations: recipients.map(recipient => {
        const personalization: Record<string, unknown> = {
          to: [this.formatEmailAddress(recipient.email, recipient.name)]
        };

        if (recipient.substitutions || globalTemplateData) {
          personalization.dynamicTemplateData = {
            ...globalTemplateData,
            ...recipient.substitutions
          };
        }

        if (recipient.customArgs) {
          personalization.customArgs = recipient.customArgs;
        }

        return personalization;
      })
    };

    await this.request<Record<string, unknown>>('POST', '/mail/send', emailData);
    
    return {
      messageId: 'batch_sent'
    };
  }

  /**
   * Create a new email template
   */
  async createTemplate(name: string, generation: 'legacy' | 'dynamic' = 'dynamic'): Promise<Template> {
    const templateData = {
      name,
      generation
    };

    return this.request<Template>('POST', '/templates', templateData);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<Template> {
    return this.request<Template>('GET', `/templates/${templateId}`);
  }

  /**
   * Update template
   */
  async updateTemplate(templateId: string, name: string): Promise<Template> {
    return this.request<Template>('PATCH', `/templates/${templateId}`, { name });
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await this.request('DELETE', `/templates/${templateId}`);
  }

  /**
   * Create template version
   */
  async createTemplateVersion(
    templateId: string,
    name: string,
    subject: string,
    htmlContent: string,
    plainContent?: string
  ): Promise<TemplateVersion> {
    const versionData = {
      templateId,
      name,
      subject,
      htmlContent,
      plainContent: plainContent || '',
      generatePlainContent: !plainContent,
      active: 1
    };

    return this.request<TemplateVersion>('POST', `/templates/${templateId}/versions`, versionData);
  }

  /**
   * Add contacts to a list
   */
  async addToList(listId: string, contacts: Contact[]): Promise<Record<string, unknown>> {
    if (!contacts || contacts.length === 0) {
      throw new Error('At least one contact is required');
    }

    const contactData = {
      listIds: [listId],
      contacts: contacts.map(contact => {
        const formattedContact: Record<string, unknown> = {
          email: contact.email
        };

        if (contact.firstName) formattedContact.firstName = contact.firstName;
        if (contact.lastName) formattedContact.lastName = contact.lastName;
        if (contact.alternateEmails) formattedContact.alternateEmails = contact.alternateEmails;
        if (contact.addressLine1) formattedContact.addressLine1 = contact.addressLine1;
        if (contact.addressLine2) formattedContact.addressLine2 = contact.addressLine2;
        if (contact.city) formattedContact.city = contact.city;
        if (contact.stateProvinceRegion) formattedContact.stateProvinceRegion = contact.stateProvinceRegion;
        if (contact.postalCode) formattedContact.postalCode = contact.postalCode;
        if (contact.country) formattedContact.country = contact.country;
        if (contact.phoneNumber) formattedContact.phoneNumber = contact.phoneNumber;
        if (contact.customFields) {
          Object.assign(formattedContact, contact.customFields);
        }

        return formattedContact;
      })
    };

    return this.request<Record<string, unknown>>('PUT', '/marketing/contacts', contactData);
  }

  /**
   * Create a new contact list
   */
  async createList(name: string): Promise<List> {
    return this.request<List>('POST', '/marketing/lists', { name });
  }

  /**
   * Get all contact lists
   */
  async getLists(): Promise<ListResponse> {
    return this.request<ListResponse>('GET', '/marketing/lists');
  }

  /**
   * Delete a contact list
   */
  async deleteList(listId: string, deleteContacts: boolean = false): Promise<void> {
    await this.request('DELETE', `/marketing/lists/${listId}`, { deleteContacts });
  }

  /**
   * Get email statistics for date range
   */
  async getEmailStats(startDate: string, endDate?: string, aggregatedBy?: 'day' | 'week' | 'month'): Promise<EmailStats[]> {
    const params: Record<string, string> = {
      startDate,
      aggregatedBy: aggregatedBy || 'day'
    };

    if (endDate) {
      params.endDate = endDate;
    }

    const queryString = new URLSearchParams(params).toString();
    return this.request<EmailStats[]>('GET', `/stats?${queryString}`);
  }

  /**
   * Validate email address
   */
  async validateEmail(email: string): Promise<ValidationResult> {
    if (!email || !this.isValidEmailFormat(email)) {
      throw new Error('Valid email address is required');
    }

    return this.request<ValidationResult>('POST', '/validations/email', { email });
  }

  /**
   * Schedule email for future delivery
   */
  async scheduleEmail(options: EmailOptions, sendAt: Date): Promise<ScheduledEmail> {
    if (sendAt <= new Date()) {
      throw new Error('Send time must be in the future');
    }

    // Generate a batch ID for the scheduled email
    const batchId = this.generateBatchId();
    
    const emailOptions = {
      ...options,
      sendAt: Math.floor(sendAt.getTime() / 1000),
      batchId
    };

    await this.sendEmail(emailOptions);

    return {
      batchId,
      status: 'pending'
    };
  }

  /**
   * Cancel scheduled email
   */
  async cancelScheduledEmail(batchId: string): Promise<void> {
    await this.request('POST', `/user/scheduled_sends/${batchId}/cancel`);
  }

  /**
   * Pause scheduled email
   */
  async pauseScheduledEmail(batchId: string): Promise<void> {
    await this.request('POST', `/user/scheduled_sends/${batchId}/pause`);
  }

  /**
   * Resume scheduled email
   */
  async resumeScheduledEmail(batchId: string): Promise<void> {
    await this.request('DELETE', `/user/scheduled_sends/${batchId}/pause`);
  }

  /**
   * Get scheduled email status
   */
  async getScheduledEmailStatus(batchId: string): Promise<ScheduledEmail> {
    return this.request<ScheduledEmail>('GET', `/user/scheduled_sends/${batchId}`);
  }

  /**
   * Suppress an email address (add to suppression list)
   */
  async suppressEmail(email: string, groupId: number): Promise<void> {
    await this.request('POST', `/asm/groups/${groupId}/suppressions`, {
      recipient_emails: [email]
    });
  }

  /**
   * Remove email from suppression list
   */
  async unsuppressEmail(email: string, groupId: number): Promise<void> {
    await this.request('DELETE', `/asm/groups/${groupId}/suppressions/${email}`);
  }

  /**
   * Get suppression groups
   */
  async getSuppressionGroups(): Promise<any[]> {
    return this.request<any[]>('GET', '/asm/groups');
  }

  /**
   * Validate email format
   */
  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('GET', '/user/profile');
      return true;
    } catch (error) {
      return false;
    }
  }
}