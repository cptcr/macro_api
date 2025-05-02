export default interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}