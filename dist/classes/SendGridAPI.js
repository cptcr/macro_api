"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendGridAPI = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * Production-ready SendGrid API wrapper for transactional email delivery
 */
class SendGridAPI {
    constructor(config) {
        this.baseUrl = 'https://api.sendgrid.com/v3';
        if (!config.apiKey) {
            throw new Error('SendGrid API key is required');
        }
        this.apiKey = config.apiKey;
        this.defaultFromEmail = config.defaultFromEmail;
        this.defaultFromName = config.defaultFromName;
    }
    async request(method, endpoint, data, customHeaders) {
        try {
            const headers = {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...customHeaders
            };
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}${endpoint}`,
                data,
                headers,
                timeout: 30000
            });
            return response.data;
        }
        catch (error) {
            this.handleSendGridError(error);
            throw error;
        }
    }
    handleSendGridError(error) {
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            const errorMessages = errors.map((err) => err.message).join(', ');
            throw new Error(`SendGrid API Error: ${errorMessages}`);
        }
    }
    formatEmailAddress(email, name) {
        return name ? { email, name } : { email };
    }
    formatEmailAddresses(emails) {
        const emailArray = Array.isArray(emails) ? emails : [emails];
        return emailArray.map(email => ({ email }));
    }
    /**
     * Send a single email
     */
    async sendEmail(options) {
        if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
            throw new Error('At least one recipient email is required');
        }
        if (!options.subject) {
            throw new Error('Email subject is required');
        }
        if (!options.text && !options.html && !options.templateId) {
            throw new Error('Email content (text, html, or templateId) is required');
        }
        const emailData = {
            personalizations: [{
                    to: this.formatEmailAddresses(options.to)
                }],
            from: this.formatEmailAddress(this.defaultFromEmail || 'noreply@example.com', this.defaultFromName),
            subject: options.subject
        };
        // Add CC and BCC if provided
        if (options.cc) {
            emailData.personalizations[0].cc = this.formatEmailAddresses(options.cc);
        }
        if (options.bcc) {
            emailData.personalizations[0].bcc = this.formatEmailAddresses(options.bcc);
        }
        // Add content
        if (options.templateId) {
            emailData.templateId = options.templateId;
            if (options.dynamicTemplateData) {
                emailData.personalizations[0].dynamicTemplateData = options.dynamicTemplateData;
            }
        }
        else {
            emailData.content = [];
            if (options.text) {
                emailData.content.push({
                    type: 'text/plain',
                    value: options.text
                });
            }
            if (options.html) {
                emailData.content.push({
                    type: 'text/html',
                    value: options.html
                });
            }
        }
        // Add optional fields
        if (options.attachments) {
            emailData.attachments = options.attachments;
        }
        if (options.customArgs) {
            emailData.personalizations[0].customArgs = options.customArgs;
        }
        if (options.headers) {
            emailData.personalizations[0].headers = options.headers;
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
        const response = await this.request('POST', '/mail/send', emailData);
        // SendGrid returns a 202 status with no body for successful sends
        // We need to extract the message ID from the response headers
        return {
            messageId: response?.messageId || 'sent'
        };
    }
    /**
     * Send template email to multiple recipients with personalization
     */
    async sendTemplateEmail(templateId, recipients, globalTemplateData) {
        if (!templateId) {
            throw new Error('Template ID is required');
        }
        if (!recipients || recipients.length === 0) {
            throw new Error('At least one recipient is required');
        }
        const emailData = {
            from: this.formatEmailAddress(this.defaultFromEmail || 'noreply@example.com', this.defaultFromName),
            templateId,
            personalizations: recipients.map(recipient => {
                const personalization = {
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
        await this.request('POST', '/mail/send', emailData);
        return {
            messageId: 'batch_sent'
        };
    }
    /**
     * Create a new email template
     */
    async createTemplate(name, generation = 'dynamic') {
        const templateData = {
            name,
            generation
        };
        return this.request('POST', '/templates', templateData);
    }
    /**
     * Get template by ID
     */
    async getTemplate(templateId) {
        return this.request('GET', `/templates/${templateId}`);
    }
    /**
     * Update template
     */
    async updateTemplate(templateId, name) {
        return this.request('PATCH', `/templates/${templateId}`, { name });
    }
    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        await this.request('DELETE', `/templates/${templateId}`);
    }
    /**
     * Create template version
     */
    async createTemplateVersion(templateId, name, subject, htmlContent, plainContent) {
        const versionData = {
            templateId,
            name,
            subject,
            htmlContent,
            plainContent: plainContent || '',
            generatePlainContent: !plainContent,
            active: 1
        };
        return this.request('POST', `/templates/${templateId}/versions`, versionData);
    }
    /**
     * Add contacts to a list
     */
    async addToList(listId, contacts) {
        if (!contacts || contacts.length === 0) {
            throw new Error('At least one contact is required');
        }
        const contactData = {
            listIds: [listId],
            contacts: contacts.map(contact => {
                const formattedContact = {
                    email: contact.email
                };
                if (contact.firstName)
                    formattedContact.firstName = contact.firstName;
                if (contact.lastName)
                    formattedContact.lastName = contact.lastName;
                if (contact.alternateEmails)
                    formattedContact.alternateEmails = contact.alternateEmails;
                if (contact.addressLine1)
                    formattedContact.addressLine1 = contact.addressLine1;
                if (contact.addressLine2)
                    formattedContact.addressLine2 = contact.addressLine2;
                if (contact.city)
                    formattedContact.city = contact.city;
                if (contact.stateProvinceRegion)
                    formattedContact.stateProvinceRegion = contact.stateProvinceRegion;
                if (contact.postalCode)
                    formattedContact.postalCode = contact.postalCode;
                if (contact.country)
                    formattedContact.country = contact.country;
                if (contact.phoneNumber)
                    formattedContact.phoneNumber = contact.phoneNumber;
                if (contact.customFields) {
                    Object.assign(formattedContact, contact.customFields);
                }
                return formattedContact;
            })
        };
        return this.request('PUT', '/marketing/contacts', contactData);
    }
    /**
     * Create a new contact list
     */
    async createList(name) {
        return this.request('POST', '/marketing/lists', { name });
    }
    /**
     * Get all contact lists
     */
    async getLists() {
        return this.request('GET', '/marketing/lists');
    }
    /**
     * Delete a contact list
     */
    async deleteList(listId, deleteContacts = false) {
        await this.request('DELETE', `/marketing/lists/${listId}`, { deleteContacts });
    }
    /**
     * Get email statistics for date range
     */
    async getEmailStats(startDate, endDate, aggregatedBy) {
        const params = {
            startDate,
            aggregatedBy: aggregatedBy || 'day'
        };
        if (endDate) {
            params.endDate = endDate;
        }
        const queryString = new URLSearchParams(params).toString();
        return this.request('GET', `/stats?${queryString}`);
    }
    /**
     * Validate email address
     */
    async validateEmail(email) {
        if (!email || !this.isValidEmailFormat(email)) {
            throw new Error('Valid email address is required');
        }
        return this.request('POST', '/validations/email', { email });
    }
    /**
     * Schedule email for future delivery
     */
    async scheduleEmail(options, sendAt) {
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
    async cancelScheduledEmail(batchId) {
        await this.request('POST', `/user/scheduled_sends/${batchId}/cancel`);
    }
    /**
     * Pause scheduled email
     */
    async pauseScheduledEmail(batchId) {
        await this.request('POST', `/user/scheduled_sends/${batchId}/pause`);
    }
    /**
     * Resume scheduled email
     */
    async resumeScheduledEmail(batchId) {
        await this.request('DELETE', `/user/scheduled_sends/${batchId}/pause`);
    }
    /**
     * Get scheduled email status
     */
    async getScheduledEmailStatus(batchId) {
        return this.request('GET', `/user/scheduled_sends/${batchId}`);
    }
    /**
     * Suppress an email address (add to suppression list)
     */
    async suppressEmail(email, groupId) {
        await this.request('POST', `/asm/groups/${groupId}/suppressions`, {
            recipient_emails: [email]
        });
    }
    /**
     * Remove email from suppression list
     */
    async unsuppressEmail(email, groupId) {
        await this.request('DELETE', `/asm/groups/${groupId}/suppressions/${email}`);
    }
    /**
     * Get suppression groups
     */
    async getSuppressionGroups() {
        return this.request('GET', '/asm/groups');
    }
    /**
     * Validate email format
     */
    isValidEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Generate unique batch ID
     */
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Test API connection
     */
    async testConnection() {
        try {
            await this.request('GET', '/user/profile');
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.SendGridAPI = SendGridAPI;
