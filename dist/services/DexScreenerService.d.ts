interface TokenProfile {
    url: string;
    chainId: string;
    tokenAddress: string;
    icon?: string;
    header?: string;
    description?: string;
    links?: Array<{
        type: string;
        label: string;
        url: string;
    }>;
}
interface TokenPair {
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    priceNative: string;
    priceUsd: string;
    fdv: number;
    marketCap: number;
    pairCreatedAt: number;
    labels: string[];
    volume: Record<string, number>;
    priceChange: Record<string, number>;
    baseToken: {
        address: string;
        name: string;
        symbol: string;
    };
    quoteToken: {
        address: string;
        name: string;
        symbol: string;
    };
    liquidity: {
        usd: number;
        base: number;
        quote: number;
    };
    boosts?: {
        active: number;
    };
    txns: Record<string, {
        buys: number;
        sells: number;
    }>;
    info?: {
        imageUrl: string;
        websites?: Array<{
            url: string;
        }>;
        socials?: Array<{
            platform: string;
            handle: string;
        }>;
    };
}
interface PriceCandle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
interface PriceHistory {
    schemaVersion: string;
    candles: PriceCandle[];
}
interface SearchResponse {
    schemaVersion: string;
    pairs: TokenPair[];
}
export declare class DexScreenerService {
    private static makeRequest;
    static getTokenProfile(chainId: string, tokenAddress: string): Promise<TokenProfile>;
    static getTokenPairs(chainId: string, tokenAddress: string): Promise<TokenPair[]>;
    static searchPairs(query: string): Promise<SearchResponse>;
    static getPairsByTokens(chainId: string, tokenAddresses: string[]): Promise<TokenPair[]>;
    static getPairInfo(chainId: string, pairId: string): Promise<SearchResponse>;
    static getPairPriceHistory(chainId: string, pairAddress: string, timeframe: string): Promise<PriceHistory>;
    static getTokenInfo(chainId: string, tokenAddress: string): Promise<{
        priceUsd: string | null;
        liquidity: number | null;
        volume24h: number | null;
        priceChange24h: number | null;
    }>;
}
export {};
