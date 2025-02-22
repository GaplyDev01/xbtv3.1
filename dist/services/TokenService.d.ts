import { GlobalMarketData, NFTCollectionData, NFTMarketData, DerivativesExchangeData, DerivativesTicker, ExchangeVolumePoint, TokenPrice, TokenChartData, TokenDetails, OHLCData, TrendingResult } from './types';
/**
 * Custom error class for token-related errors
 */
export declare class TokenServiceError extends Error {
    code: string;
    source?: "coingecko" | "quicknode" | undefined;
    constructor(message: string, code: string, source?: "coingecko" | "quicknode" | undefined);
}
export type MarketChartData = TokenChartData;
export declare class TokenService {
    private static readonly DEFAULT_IMAGE_URL;
    private static readonly FRESHNESS_THRESHOLDS;
    /**
     * Fetches token data from CoinGecko
     * @param address Token address
     * @returns Token details or null if not found
     */
    private static fetchCoinGeckoData;
    private static fetchQuickNodeData;
    /**
     * Creates default token details for a given address
     * @param address - Token contract address
     * @returns Default token details object
     */
    private static getDefaultTokenDetails;
    /**
     * Fetches comprehensive token details from multiple sources
     * @param address - Token contract address
     * @returns Promise resolving to token details
     * @throws {TokenServiceError} When address is invalid or all data sources fail
     */
    static getTokenDetails(address: string): Promise<TokenDetails>;
    static getMarketChart(tokenAddress: string, days: string | number): Promise<MarketChartData>;
    /**
     * Fetches historical volume chart data for an exchange
     * @param exchangeId Exchange ID from CoinGecko's /exchanges/list
     * @param days Number of days of data to fetch (affects granularity)
     * @param convertToUSD Whether to convert BTC volume to USD
     * @returns Array of volume data points
     */
    static getExchangeVolumeChart(exchangeId: string, days: number | string, convertToUSD?: boolean): Promise<ExchangeVolumePoint[]>;
    /**
     * Get global cryptocurrency market data
     * @returns Global market statistics
     */
    static getGlobalMarketData(): Promise<GlobalMarketData>;
    /**
     * Get trending coins and NFTs in the last 24 hours
     * @returns Trending search results
     */
    static getTrendingSearches(): Promise<TrendingResult>;
    /**
     * Get NFT collection data by ID
     * @param nftId The NFT collection ID from CoinGecko
     * @returns Detailed NFT collection data
     */
    static getNFTCollectionData(nftId: string): Promise<NFTCollectionData>;
    /**
     * Get NFT collection data by contract address
     * @param assetPlatformId The platform ID (e.g., 'ethereum')
     * @param contractAddress The NFT contract address
     * @returns Detailed NFT collection data
     */
    static getNFTCollectionByContract(assetPlatformId: string, contractAddress: string): Promise<NFTCollectionData>;
    /**
     * Get NFT collection market chart data
     * @param nftId The NFT collection ID
     * @param days Number of days of data to fetch
     * @returns Historical market data for the NFT collection
     */
    /**
     * Get derivatives exchange data
     * @param exchangeId The derivatives exchange ID
     * @returns Detailed exchange data
     */
    static getDerivativesExchange(exchangeId: string): Promise<DerivativesExchangeData>;
    /**
     * Get all derivatives tickers
     * @returns Array of derivatives tickers
     */
    static getDerivativesTickers(): Promise<DerivativesTicker[]>;
    static getNFTMarketChart(nftId: string, days: number): Promise<NFTMarketData>;
    static getTokenOHLC(tokenAddress: string, days?: string, interval?: string): Promise<OHLCData[]>;
    static getTokenMarketChart(tokenAddress: string, days?: string | number, interval?: string): Promise<MarketChartData>;
    private static getQuickNodeTokens;
    private static getCoinGeckoTokens;
    /**
     * Fetches prices for multiple tokens in a single request
     * @param addresses Array of token addresses
     * @returns Array of token prices with market data
     */
    static getBatchTokenPrices(addresses: string[]): Promise<TokenPrice[]>;
    static getTopTokens(limit?: number): Promise<TokenPrice[]>;
    /**
     * Get historical market data including price, market cap, and 24h volume
     * Granularity is auto-adjusted based on the time range:
     * - 1 day = 5-minute intervals
     * - 2-90 days = hourly intervals
     * - >90 days = daily intervals (00:00 UTC)
     *
     * @param tokenAddress - Token address to get chart data for
     * @param days - Number of days of history to fetch (use 'max' for maximum available)
     * @param interval - Optional interval override ('5m', 'hourly', 'daily'). Leave empty for auto granularity
     * @returns Promise<TokenChartData> with prices, market caps and volumes
     */
    static getTokenChartData(tokenAddress: string, days: number | 'max', interval?: '5m' | 'hourly' | 'daily'): Promise<TokenChartData>;
}
