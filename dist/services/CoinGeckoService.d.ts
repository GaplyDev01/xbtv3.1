interface CoinGeckoTokenInfo {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_percentage_24h: number;
    market_cap_rank: number;
    high_24h: number;
    low_24h: number;
    circulating_supply: number;
    total_supply: number;
    last_updated_at?: number;
}
interface TokenPriceResponse {
    [key: string]: {
        usd: number;
        usd_market_cap?: number;
        usd_24h_vol?: number;
        usd_24h_change?: number;
        last_updated_at?: number;
    };
}
interface OHLCData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
}
interface MarketDataOptions {
    category?: string;
    order?: 'market_cap_asc' | 'market_cap_desc' | 'volume_asc' | 'volume_desc' | 'id_asc' | 'id_desc';
    perPage?: number;
    page?: number;
    sparkline?: boolean;
    priceChangePercentage?: Array<'1h' | '24h' | '7d' | '14d' | '30d' | '200d' | '1y'>;
    precision?: number;
    ids?: string;
}
interface MarketData extends CoinGeckoTokenInfo {
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_24h_in_currency?: number;
    price_change_percentage_7d_in_currency?: number;
    price_change_percentage_14d_in_currency?: number;
    price_change_percentage_30d_in_currency?: number;
    price_change_percentage_200d_in_currency?: number;
    price_change_percentage_1y_in_currency?: number;
    sparkline_in_7d?: {
        price: number[];
    };
}
export declare class CoinGeckoService {
    private static readonly BASE_URL;
    private static readonly HEADERS;
    /**
     * Fetches token price and optional market data using the simple/token_price endpoint
     * @param platform Platform ID (e.g., 'solana')
     * @param contractAddresses Array of contract addresses
     * @param options Optional parameters for additional data
     */
    static getTokenPrices(platform: string, contractAddresses: string[], options?: {
        includeMarketCap?: boolean;
        include24hVol?: boolean;
        include24hChange?: boolean;
        includeLastUpdated?: boolean;
        precision?: number;
    }): Promise<TokenPriceResponse>;
    private static readonly BASE_URL;
    private static readonly FREE_BASE_URL;
    private static readonly CACHE_DURATION;
    private static readonly SOLANA_PLATFORM_ID;
    private static cache;
    private static makeRequest;
    static getTokenInfo(tokenId: string): Promise<CoinGeckoTokenInfo>;
    static getOHLCData(tokenId: string, days?: number): Promise<OHLCData[]>;
    static searchTokens(query: string): Promise<CoinGeckoTokenInfo[]>;
    static getMarketData(options?: MarketDataOptions): Promise<MarketData[]>;
    static getTokenMarketData(tokenIds: string[], options?: Omit<MarketDataOptions, 'category'>): Promise<MarketData[]>;
    static getTopTokens(limit?: number, options?: Omit<MarketDataOptions, 'perPage' | 'page'>): Promise<MarketData[]>;
    static getTrendingTokens(): Promise<MarketData[]>;
}
export {};
