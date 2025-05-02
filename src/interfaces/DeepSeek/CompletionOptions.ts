export default interface CompletionOptions {
    model: string;
    prompt: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    stream?: boolean;
    stop?: string[];
}