import ChatGPTConfig from '../interfaces/ChatGPT/ChatGPTConfig';
import Message from '../interfaces/ChatGPT/Mesage';
import ChatCompletionOptions from '../interfaces/ChatGPT/ChatCompletionOptions';
import EmbeddingOptions from '../interfaces/ChatGPT/EmbeddingOptions';
/**
 * ChatGPT API client for interacting with OpenAI's models
 */
export declare class ChatGPT {
    private apiKey;
    private organizationId?;
    private baseUrl;
    /**
     * Create a new ChatGPT API client
     * @param config Configuration options
     */
    constructor(config: ChatGPTConfig);
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
    conversation(conversation: Message[], model?: string): Promise<any>;
    /**
     * Helper function to create embeddings for a text or array of texts
     * @param text Text or array of texts to embed
     * @param model Model name to use
     */
    embed(text: string | string[], model?: string): Promise<any>;
    /**
     * Get available models
     */
    listModels(): Promise<any>;
    /**
     * Helper function to generate text with function calling capabilities
     * @param prompt User message
     * @param functions Array of function definitions
     * @param model Model name to use
     */
    withFunctions(prompt: string, functions: any[], model?: string): Promise<any>;
    /**
     * Helper function to generate text with tool calling capabilities
     * @param prompt User message
     * @param tools Array of tool definitions
     * @param model Model name to use
     */
    withTools(prompt: string, tools: any[], model?: string): Promise<any>;
}
