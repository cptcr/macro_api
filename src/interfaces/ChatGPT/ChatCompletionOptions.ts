import Message from "./Mesage";

export default interface ChatCompletionOptions {
    model: string;
    messages: Message[];
    temperature?: number;
    top_p?: number;
    n?: number;
    stream?: boolean;
    stop?: string | string[];
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    logit_bias?: Record<string, number>;
    user?: string;
    functions?: Record<string, unknown>[];
    function_call?: 'auto' | 'none' | { name: string };
    tools?: Record<string, unknown>[];
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

