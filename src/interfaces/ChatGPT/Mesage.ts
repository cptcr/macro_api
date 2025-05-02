export default interface Message {
    role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
    content: string | null | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: { url: string; detail?: 'low' | 'high' | 'auto' };
    }>;
    name?: string;
    function_call?: {
      name: string;
      arguments: string;
    };
    tool_calls?: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }>;
}