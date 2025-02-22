interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    price: number;
    volume24h: number;
    priceChange24h: number;
    marketCap: number;
    logoURI?: string;
    supply?: {
        total: number;
        circulating: number;
    };
}
interface PriceHistory {
    timestamp: number;
    price: number;
    volume: number;
}
export declare class QuickNodeService {
    private static makeRequest;
    static getTokenInfo(tokenAddress: string): Promise<TokenInfo>;
    static getTokenPriceHistory(tokenAddress: string, startTime: number, endTime: number): Promise<PriceHistory[]>;
    static searchTokens(query: string): Promise<TokenInfo[]>;
}
export {};
