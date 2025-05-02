import DeepSeekConfig from '../interfaces/DeepSeek/DeepSeekConfig';
import ChatMessage from '../interfaces/DeepSeek/ChatMessage';
import ChatCompletionOptions from '../interfaces/DeepSeek/ChatCompletionOptions';
import CompletionOptions from '../interfaces/DeepSeek/CompletionOptions';
import EmbeddingOptions from '../interfaces/DeepSeek/EmbeddingOptions';
/**
 * DeepSeek API client for interacting with DeepSeek's AI models
 */
export declare class DeepSeek {
    private apiKey;
    private baseUrl;
    /**
     * Create a new DeepSeek API client
     * @param config Configuration options
     */
    constructor(config: DeepSeekConfig);
    /**
     * Get headers for API requests
     */
    private getHeaders;
    /**
     * Create a chat completion
     * @param options Chat completion options
     */
    createChatCompletion(options: ChatCompletionOptions): Promise<any>;
    /**
     * Create a completion
     * @param options Completion options
     */
    createCompletion(options: CompletionOptions): Promise<any>;
    /**
     * Create embeddings
     * @param options Embedding options
     */
    createEmbeddings(options: EmbeddingOptions): Promise<any>;
    /**
     * Create a streaming chat completion
     * @param options Chat completion options
     * @param onData Callback function for each chunk of data
     */
    createStreamingChatCompletion(options: ChatCompletionOptions, onData: (data: any) => void, onError?: (error: any) => void, onEnd?: () => void): Promise<any>;
    /**
     * Generate code completions using DeepSeek code models
     * @param prompt Code prompt
     * @param options Additional options
     */
    generateCode(prompt: string, options?: {
        model?: string;
        temperature?: number;
        max_tokens?: number;
        stop?: string[];
    }): Promise<any>;
    /**
     * Get available models
     */
    listModels(): Promise<any>;
    /**
     * Helper function to create a simple chat with the model
     * @param prompt User message
     * @param systemPrompt Optional system message
     * @param model Model name to use
     */
    chat(prompt: string, systemPrompt?: string, model?: string): Promise<any>;
    /**
     * Helper function to create a conversation with multiple turns
     * @param conversation Array of messages
     * @param model Model name to use
     */
    conversation(conversation: ChatMessage[], model?: string): Promise<any>;
}
