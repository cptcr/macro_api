"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeek = void 0;
const axios_1 = __importDefault(require("axios"));
/**
 * DeepSeek API client for interacting with DeepSeek's AI models
 */
class DeepSeek {
    /**
     * Create a new DeepSeek API client
     * @param config Configuration options
     */
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || 'https://api.deepseek.com/v1';
    }
    /**
     * Get headers for API requests
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }
    /**
     * Create a chat completion
     * @param options Chat completion options
     */
    async createChatCompletion(options) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, options, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            if (error.response && error.response.data) {
                throw new Error(`DeepSeek API Error: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Create a completion
     * @param options Completion options
     */
    async createCompletion(options) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/completions`, options, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            if (error.response && error.response.data) {
                throw new Error(`DeepSeek API Error: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Create embeddings
     * @param options Embedding options
     */
    async createEmbeddings(options) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/embeddings`, options, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            if (error.response && error.response.data) {
                throw new Error(`DeepSeek API Error: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Create a streaming chat completion
     * @param options Chat completion options
     * @param onData Callback function for each chunk of data
     */
    async createStreamingChatCompletion(options, onData, onError, onEnd) {
        // Ensure stream option is set to true
        options.stream = true;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, options, {
                headers: this.getHeaders(),
                responseType: 'stream'
            });
            const stream = response.data;
            stream.on('data', (chunk) => {
                try {
                    const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            if (data === '[DONE]') {
                                if (onEnd)
                                    onEnd();
                                return;
                            }
                            try {
                                const parsedData = JSON.parse(data);
                                onData(parsedData);
                            }
                            catch (e) {
                                console.warn('Error parsing DeepSeek stream data:', e);
                            }
                        }
                    }
                }
                catch (e) {
                    if (onError)
                        onError(e);
                }
            });
            stream.on('error', (err) => {
                if (onError)
                    onError(err);
            });
            stream.on('end', () => {
                if (onEnd)
                    onEnd();
            });
            // Return the stream so it can be canceled if needed
            return stream;
        }
        catch (error) {
            if (onError)
                onError(error);
            throw error;
        }
    }
    /**
     * Generate code completions using DeepSeek code models
     * @param prompt Code prompt
     * @param options Additional options
     */
    async generateCode(prompt, options = {}) {
        const model = options.model || 'deepseek-coder-1.3b-instruct';
        return this.createCompletion({
            model,
            prompt,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.max_tokens ?? 2048,
            stop: options.stop
        });
    }
    /**
     * Get available models
     */
    async listModels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/models`, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            if (error.response && error.response.data) {
                throw new Error(`DeepSeek API Error: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
    /**
     * Helper function to create a simple chat with the model
     * @param prompt User message
     * @param systemPrompt Optional system message
     * @param model Model name to use
     */
    async chat(prompt, systemPrompt, model = 'deepseek-chat') {
        const messages = [];
        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }
        messages.push({
            role: 'user',
            content: prompt
        });
        const response = await this.createChatCompletion({
            model,
            messages,
            temperature: 0.7
        });
        return response.choices[0]?.message?.content || '';
    }
    /**
     * Helper function to create a conversation with multiple turns
     * @param conversation Array of messages
     * @param model Model name to use
     */
    async conversation(conversation, model = 'deepseek-chat') {
        const response = await this.createChatCompletion({
            model,
            messages: conversation,
            temperature: 0.7
        });
        return response.choices[0]?.message?.content || '';
    }
}
exports.DeepSeek = DeepSeek;
