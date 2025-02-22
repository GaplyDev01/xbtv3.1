export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface TokenAnalysisRequest {
    tokenSymbol: string;
    tokenName: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
    question?: string;
}
export declare class GroqService {
    static analyzeToken(params: TokenAnalysisRequest): Promise<string>;
    static chat(messages: ChatMessage[]): Promise<string>;
}
