import axios from 'axios';
import DeepSeekConfig from '../interfaces/DeepSeek/DeepSeekConfig';
import ChatMessage from '../interfaces/DeepSeek/ChatMessage';
import ChatCompletionOptions from '../interfaces/DeepSeek/ChatCompletionOptions';
import CompletionOptions from '../interfaces/DeepSeek/CompletionOptions';
import EmbeddingOptions from '../interfaces/DeepSeek/EmbeddingOptions';

/**
 * DeepSeek API client for interacting with DeepSeek's AI models
 */
export class DeepSeek {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Create a new DeepSeek API client
   * @param config Configuration options
   */
  constructor(config: DeepSeekConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.deepseek.com/v1';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a chat completion
   * @param options Chat completion options
   */
  async createChatCompletion(options: ChatCompletionOptions) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        options,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
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
  async createCompletion(options: CompletionOptions) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        options,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
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
  async createEmbeddings(options: EmbeddingOptions) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        options,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
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
  async createStreamingChatCompletion(
    options: ChatCompletionOptions,
    onData: (data: any) => void,
    onError?: (error: any) => void,
    onEnd?: () => void
  ) {
    // Ensure stream option is set to true
    options.stream = true;
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        options,
        {
          headers: this.getHeaders(),
          responseType: 'stream'
        }
      );
      
      const stream = response.data;
      
      stream.on('data', (chunk: Buffer) => {
        try {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              if (data === '[DONE]') {
                if (onEnd) onEnd();
                return;
              }
              
              try {
                const parsedData = JSON.parse(data);
                onData(parsedData);
              } catch (e) {
                console.warn('Error parsing DeepSeek stream data:', e);
              }
            }
          }
        } catch (e) {
          if (onError) onError(e);
        }
      });
      
      stream.on('error', (err: any) => {
        if (onError) onError(err);
      });
      
      stream.on('end', () => {
        if (onEnd) onEnd();
      });
      
      // Return the stream so it can be canceled if needed
      return stream;
    } catch (error: any) {
      if (onError) onError(error);
      throw error;
    }
  }

  /**
   * Generate code completions using DeepSeek code models
   * @param prompt Code prompt
   * @param options Additional options
   */
  async generateCode(prompt: string, options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stop?: string[];
  } = {}) {
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
      const response = await axios.get(
        `${this.baseUrl}/models`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
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
  async chat(prompt: string, systemPrompt?: string, model: string = 'deepseek-chat') {
    const messages: ChatMessage[] = [];
    
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
  async conversation(conversation: ChatMessage[], model: string = 'deepseek-chat') {
    const response = await this.createChatCompletion({
      model,
      messages: conversation,
      temperature: 0.7
    });
    
    return response.choices[0]?.message?.content || '';
  }
}