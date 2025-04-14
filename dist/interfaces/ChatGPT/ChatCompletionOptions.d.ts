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
    functions?: any[];
    function_call?: 'auto' | 'none' | {
        name: string;
    };
    tools?: any[];
    tool_choice?: 'auto' | 'none' | {
        type: 'function';
        function: {
            name: string;
        };
    };
}
