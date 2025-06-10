import axios from 'axios';
import ChatGPTConfig from '../interfaces/ChatGPT/ChatGPTConfig';
import Message from '../interfaces/ChatGPT/Mesage';
import ChatCompletionOptions from '../interfaces/ChatGPT/ChatCompletionOptions';
import EmbeddingOptions from '../interfaces/ChatGPT/EmbeddingOptions';

/**
 * ChatGPT API client for interacting with OpenAI's models
 */
export class ChatGPT {
  private apiKey: string;
  private organizationId?: string;
  private baseUrl: string;

  /**
   * Create a new ChatGPT API client
   * @param config Configuration options
   */
  constructor(config: ChatGPTConfig) {
    this.apiKey = config.apiKey;
    this.organizationId = config.organizationId;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    if (this.organizationId) {
      headers['OpenAI-Organization'] = this.organizationId;
    }

    return headers;
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
    } catch (error: unknown) {
      if (error.response && error.response.data) {
        throw new Error(`OpenAI API Error: ${JSON.stringify(error.response.data)}`);
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
    } catch (error: unknown) {
      if (error.response && error.response.data) {
        throw new Error(`OpenAI API Error: ${JSON.stringify(error.response.data)}`);
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
    onData: (data: Record<string, unknown>) => void,
    onError?: (error: unknown) => void,
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
                console.warn('Error parsing OpenAI stream data:', String(e));
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
    } catch (error: unknown) {
      if (onError) onError(error);
      throw error;
    }
  }

  /**
   * Helper function to create a simple chat with the model
   * @param prompt User message
   * @param systemPrompt Optional system message
   * @param model Model name to use
   */
  async chat(prompt: string, systemPrompt?: string, model: string = 'gpt-4o') {
    const messages: Message[] = [];
    
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
  async conversation(conversation: Message[], model: string = 'gpt-4o') {
    const response = await this.createChatCompletion({
      model,
      messages: conversation,
      temperature: 0.7
    });
    
    return response.choices[0]?.message?.content || '';
  }

  /**
   * Helper function to create embeddings for a text or array of texts
   * @param text Text or array of texts to embed
   * @param model Model name to use
   */
  async embed(text: string | string[], model: string = 'text-embedding-3-small') {
    const response = await this.createEmbeddings({
      model,
      input: text
    });
    
    return response.data;
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
    } catch (error: unknown) {
      if (error.response && error.response.data) {
        throw new Error(`OpenAI API Error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Helper function to generate text with function calling capabilities
   * @param prompt User message
   * @param functions Array of function definitions
   * @param model Model name to use
   */
  async withFunctions(prompt: string, functions: Record<string, unknown>[], model: string = 'gpt-4o') {
    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ];
    
    const response = await this.createChatCompletion({
      model,
      messages,
      functions,
      function_call: 'auto'
    });
    
    return response.choices[0]?.message;
  }

  /**
   * Helper function to generate text with tool calling capabilities
   * @param prompt User message
   * @param tools Array of tool definitions
   * @param model Model name to use
   */
  async withTools(prompt: string, tools: Record<string, unknown>[], model: string = 'gpt-4o') {
    const messages: Message[] = [
      {
        role: 'user',
        content: prompt
      }
    ];
    
    const response = await this.createChatCompletion({
      model,
      messages,
      tools,
      tool_choice: 'auto'
    });
    
    return response.choices[0]?.message;
  }
}


