import ChatMessage from "./ChatMessage";

export default interface ChatCompletionOptions {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string[];
}