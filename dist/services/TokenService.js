"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = exports.TokenServiceError = void 0;
const QuickNodeService_1 = require("./QuickNodeService");
const CoinGeckoService_1 = require("./CoinGeckoService");
const validators_1 = require("./validators");
const types_1 = require("./types");
/**
 * Custom error class for token-related errors
 */
class TokenServiceError extends Error {
    constructor(message, code, source) {
        super(message);
        this.code = code;
        this.source = source;
        this.name = 'TokenServiceError';
    }
}
exports.TokenServiceError = TokenServiceError;
class TokenService {
    /**
     * Fetches token data from CoinGecko
     * @param address Token address
     * @returns Token details or null if not found
     */
    static async fetchCoinGeckoData(address) {
        try {
            // Get token price and market data using the simple/token_price endpoint
            const tokenPrices = await CoinGeckoService_1.CoinGeckoService.getTokenPrices('solana', [address], {
                includeMarketCap: true,
                include24hVol: true,
                include24hChange: true,
                includeLastUpdated: true,
                precision: 8
            });
            const tokenData = tokenPrices[address.toLowerCase()];
            if (!tokenData)
                return null;
            // Get additional token info for metadata
            const tokenInfo = await CoinGeckoService_1.CoinGeckoService.getTokenInfo(address);
            return {
                id: address,
                name: (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.name) || 'Unknown Token',
                symbol: (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.symbol) || 'UNKNOWN',
                image: {
                    large: (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.image) || '',
                    small: (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.image) || '',
                    thumb: (tokenInfo === null || tokenInfo === void 0 ? void 0 : tokenInfo.image) || ''
                },
                market_data: {
                    current_price: { usd: tokenData.usd },
                    price_change_percentage_24h: tokenData.usd_24h_change || 0,
                    market_cap: { usd: tokenData.usd_market_cap || 0 },
                    total_volume: { usd: tokenData.usd_24h_vol || 0 },
                    high_24h: { usd: 0 }, // Not available in simple endpoint
                    low_24h: { usd: 0 } // Not available in simple endpoint
                },
                description: { en: '' },
                last_updated_at: tokenData.last_updated_at
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch CoinGecko data: ${errorMessage}`, 'COINGECKO_FETCH_ERROR', 'coingecko');
        }
    }
    static async fetchQuickNodeData(address) {
        try {
            const tokenInfo = await QuickNodeService_1.QuickNodeService.getTokenInfo(address);
            if (!tokenInfo)
                return null;
            return {
                id: tokenInfo.address,
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                image: {
                    large: tokenInfo.logoURI || '',
                    small: tokenInfo.logoURI || '',
                    thumb: tokenInfo.logoURI || ''
                },
                market_data: {
                    current_price: { usd: tokenInfo.price },
                    price_change_percentage_24h: tokenInfo.priceChange24h,
                    market_cap: { usd: tokenInfo.marketCap },
                    total_volume: { usd: tokenInfo.volume24h },
                    high_24h: { usd: 0 },
                    low_24h: { usd: 0 }
                },
                description: { en: '' }
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch QuickNode data: ${errorMessage}`, 'QUICKNODE_FETCH_ERROR', 'quicknode');
        }
    }
    /**
     * Creates default token details for a given address
     * @param address - Token contract address
     * @returns Default token details object
     */
    static getDefaultTokenDetails(address) {
        const imageUrl = this.DEFAULT_IMAGE_URL.replace('{address}', address);
        return {
            id: address,
            name: 'Unknown Token',
            symbol: 'UNKNOWN',
            image: {
                large: imageUrl,
                small: imageUrl,
                thumb: imageUrl
            },
            market_data: {
                current_price: { usd: 0 },
                price_change_percentage_24h: 0,
                market_cap: { usd: 0 },
                total_volume: { usd: 0 },
                high_24h: { usd: 0 },
                low_24h: { usd: 0 }
            },
            description: { en: '' }
        };
    }
    /**
     * Fetches comprehensive token details from multiple sources
     * @param address - Token contract address
     * @returns Promise resolving to token details
     * @throws {TokenServiceError} When address is invalid or all data sources fail
     */
    static async getTokenDetails(address) {
        // Input validation
        const addressResult = validators_1.solanaAddressSchema.safeParse(address);
        if (!addressResult.success) {
            throw new TokenServiceError('Invalid Solana token address', 'INVALID_ADDRESS');
        }
        let tokenDetails = this.getDefaultTokenDetails(address);
        let errors = [];
        try {
            // Try CoinGecko first for most comprehensive data
            try {
                const coinGeckoData = await TokenService.fetchCoinGeckoData(address);
                if (coinGeckoData)
                    return coinGeckoData;
            }
            catch (error) {
                errors.push(error);
            }
            // Fallback: QuickNode
            try {
                const quickNodeData = await TokenService.fetchQuickNodeData(address);
                if (quickNodeData)
                    return quickNodeData;
            }
            catch (error) {
                errors.push(error);
            }
            // If all sources failed with actual errors (not just missing data)
            if (errors.length === 2) {
                throw new TokenServiceError('All data sources failed', 'DATA_SOURCES_FAILED', undefined);
            }
            return tokenDetails;
        }
        catch (error) {
            console.error('Error fetching token details:', error);
            if (error instanceof TokenServiceError) {
                throw error;
            }
            throw new TokenServiceError('Failed to fetch token details', 'UNKNOWN_ERROR', undefined);
        }
    }
    static async getMarketChart(tokenAddress, days) {
        try {
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - (typeof days === 'string' ? parseInt(days) : days) * 24 * 60 * 60;
            const history = await QuickNodeService_1.QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
            return {
                prices: history.map(point => [point.timestamp * 1000, point.price]),
                market_caps: history.map(point => [point.timestamp * 1000, point.price * point.volume]), // Approximate
                total_volumes: history.map(point => [point.timestamp * 1000, point.volume])
            };
        }
        catch (error) {
            console.error('Error fetching market chart:', error);
            throw error;
        }
    }
    /**
     * Fetches historical volume chart data for an exchange
     * @param exchangeId Exchange ID from CoinGecko's /exchanges/list
     * @param days Number of days of data to fetch (affects granularity)
     * @param convertToUSD Whether to convert BTC volume to USD
     * @returns Array of volume data points
     */
    static async getExchangeVolumeChart(exchangeId, days, convertToUSD = false) {
        var _a;
        try {
            const volumeData = await CoinGeckoService_1.CoinGeckoService.getExchangeVolumeChart(exchangeId, days);
            if (!(volumeData === null || volumeData === void 0 ? void 0 : volumeData.length)) {
                throw new TokenServiceError('No volume data available', 'COINGECKO_NO_VOLUME_DATA', 'coingecko');
            }
            let btcToUsdRate;
            if (convertToUSD) {
                const rates = await CoinGeckoService_1.CoinGeckoService.getExchangeRates();
                btcToUsdRate = (_a = rates === null || rates === void 0 ? void 0 : rates.bitcoin) === null || _a === void 0 ? void 0 : _a.usd;
            }
            return volumeData.map(([timestamp, volumeBTC]) => {
                const point = {
                    timestamp,
                    volumeBTC: parseFloat(volumeBTC)
                };
                if (convertToUSD && btcToUsdRate) {
                    point.volumeUSD = point.volumeBTC * btcToUsdRate;
                }
                return point;
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch exchange volume data: ${errorMessage}`, 'COINGECKO_VOLUME_ERROR', 'coingecko');
        }
    }
    /**
     * Get global cryptocurrency market data
     * @returns Global market statistics
     */
    static async getGlobalMarketData() {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getGlobalData();
            if (!data) {
                throw new TokenServiceError('No global market data available', 'COINGECKO_NO_GLOBAL_DATA', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch global market data: ${errorMessage}`, 'COINGECKO_GLOBAL_ERROR', 'coingecko');
        }
    }
    /**
     * Get trending coins and NFTs in the last 24 hours
     * @returns Trending search results
     */
    static async getTrendingSearches() {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getTrending();
            if (!data) {
                throw new TokenServiceError('No trending data available', 'COINGECKO_NO_TRENDING_DATA', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch trending data: ${errorMessage}`, 'COINGECKO_TRENDING_ERROR', 'coingecko');
        }
    }
    /**
     * Get NFT collection data by ID
     * @param nftId The NFT collection ID from CoinGecko
     * @returns Detailed NFT collection data
     */
    static async getNFTCollectionData(nftId) {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getNFTData(nftId);
            if (!data) {
                throw new TokenServiceError('No NFT collection data available', 'COINGECKO_NO_NFT_DATA', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch NFT collection data: ${errorMessage}`, 'COINGECKO_NFT_ERROR', 'coingecko');
        }
    }
    /**
     * Get NFT collection data by contract address
     * @param assetPlatformId The platform ID (e.g., 'ethereum')
     * @param contractAddress The NFT contract address
     * @returns Detailed NFT collection data
     */
    static async getNFTCollectionByContract(assetPlatformId, contractAddress) {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getNFTByContract(assetPlatformId, contractAddress);
            if (!data) {
                throw new TokenServiceError('No NFT collection data available', 'COINGECKO_NO_NFT_DATA', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch NFT collection data: ${errorMessage}`, 'COINGECKO_NFT_ERROR', 'coingecko');
        }
    }
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
    static async getDerivativesExchange(exchangeId) {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getDerivativesExchange(exchangeId);
            if (!data) {
                throw new TokenServiceError('No derivatives exchange data available', 'COINGECKO_NO_DERIVATIVES_DATA', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch derivatives exchange data: ${errorMessage}`, 'COINGECKO_DERIVATIVES_ERROR', 'coingecko');
        }
    }
    /**
     * Get all derivatives tickers
     * @returns Array of derivatives tickers
     */
    static async getDerivativesTickers() {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getDerivativesTickers();
            if (!(data === null || data === void 0 ? void 0 : data.length)) {
                throw new TokenServiceError('No derivatives tickers available', 'COINGECKO_NO_DERIVATIVES_TICKERS', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch derivatives tickers: ${errorMessage}`, 'COINGECKO_DERIVATIVES_TICKERS_ERROR', 'coingecko');
        }
    }
    static async getNFTMarketChart(nftId, days) {
        try {
            const data = await CoinGeckoService_1.CoinGeckoService.getNFTMarketChart(nftId, days);
            if (!data) {
                throw new TokenServiceError('No NFT market chart data available', 'COINGECKO_NO_NFT_CHART_DATA', 'coingecko');
            }
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new TokenServiceError(`Failed to fetch NFT market chart data: ${errorMessage}`, 'COINGECKO_NFT_CHART_ERROR', 'coingecko');
        }
    }
    static async getTokenOHLC(tokenAddress, days = '30', interval) {
        var _a, _b;
        try {
            // Try CoinGecko first
            try {
                const coinGeckoData = await CoinGeckoService_1.CoinGeckoService.getOHLCData(tokenAddress, parseInt(days));
                if (coinGeckoData.length > 0) {
                    return coinGeckoData.map(data => ({
                        time: data.timestamp,
                        open: data.open,
                        high: data.high,
                        low: data.low,
                        close: data.close
                    }));
                }
            }
            catch (coinGeckoError) {
                console.error('Error fetching CoinGecko OHLC data:', coinGeckoError);
            }
            // Try QuickNode
            try {
                const endTime = Math.floor(Date.now() / 1000);
                const startTime = endTime - (parseInt(days) * 24 * 60 * 60);
                const quickNodeData = await QuickNodeService_1.QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
                if (quickNodeData.length > 0) {
                    return quickNodeData.map((point) => ({
                        time: point.timestamp * 1000,
                        open: point.price,
                        high: point.price,
                        low: point.price,
                        close: point.price
                    }));
                }
            }
            catch (quickNodeError) {
                console.error('Error fetching QuickNode OHLC data:', quickNodeError);
            }
            // Fallback to Birdeye
            try {
                const endTime = Math.floor(Date.now() / 1000);
                const startTime = endTime - (parseInt(days) * 24 * 60 * 60);
                const birdeyeData = await BirdeyeService.getPriceHistory(tokenAddress, startTime, endTime);
                if (((_b = (_a = birdeyeData.data) === null || _a === void 0 ? void 0 : _a.items) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                    return birdeyeData.data.items.map(point => ({
                        time: point.unixTime * 1000,
                        open: point.value,
                        high: point.value,
                        low: point.value,
                        close: point.value
                    }));
                }
            }
            catch (birdeyeError) {
                console.error('Error fetching Birdeye OHLC data:', birdeyeError);
            }
            throw new Error('No price history data available from any source');
        }
        catch (error) {
            console.error('Error fetching OHLC data:', error);
            throw error;
        }
    }
    static async getTokenMarketChart(tokenAddress, days = '30', interval) {
        var _a, _b;
        try {
            // Try CoinGecko first
            try {
                const coinGeckoData = await CoinGeckoService_1.CoinGeckoService.getMarketData({
                    ids: tokenAddress,
                    perPage: 1,
                    sparkline: true
                });
                if (coinGeckoData.length > 0) {
                    return {
                        prices: ((_b = (_a = coinGeckoData[0].sparkline_in_7d) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.map((price, i) => [Date.now() - (7 - i / 24) * 24 * 60 * 60 * 1000, price])) || [],
                        market_caps: [],
                        total_volumes: []
                    };
                }
            }
            catch (error) {
                console.error('Error fetching CoinGecko market chart:', error);
            }
            // Fallback to QuickNode
            const endTime = Math.floor(Date.now() / 1000);
            const startTime = endTime - (typeof days === 'string' ? parseInt(days) : days) * 24 * 60 * 60;
            const history = await QuickNodeService_1.QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
            return {
                prices: history.map(point => [point.timestamp * 1000, point.price]),
                market_caps: history.map(point => [point.timestamp * 1000, point.price * point.volume]), // Approximate
                total_volumes: history.map(point => [point.timestamp * 1000, point.volume])
            };
        }
        catch (error) {
            console.error('Error fetching token market chart:', error);
            throw error;
        }
    }
    static async getQuickNodeTokens(limit = 50) {
        try {
            const tokens = await QuickNodeService_1.QuickNodeService.searchTokens('SOL');
            if (!(tokens === null || tokens === void 0 ? void 0 : tokens.length)) {
                throw new TokenServiceError('No token data available from QuickNode', 'QUICKNODE_NO_DATA', 'quicknode');
            }
            const topTokens = tokens.slice(0, limit);
            return topTokens.map(token => ({
                id: token.address,
                symbol: token.symbol || 'UNKNOWN',
                name: token.name || 'Unknown Token',
                current_price: token.price || 0,
                market_cap: token.marketCap || 0,
                market_cap_rank: 0,
                price_change_percentage_24h: token.priceChange24h || 0,
                volume_24h: token.volume24h || 0,
                liquidity_usd: 0, // Not directly available from QuickNode
                sparkline_7d: [],
                imageUrl: token.logoURI || '',
                source: 'quicknode',
                verified: true,
                info: {
                    imageUrl: token.logoURI || '',
                    source: 'quicknode',
                    verified: true
                }
            }));
        }
        catch (error) {
            if (error instanceof TokenServiceError) {
                throw error;
            }
            throw new TokenServiceError('Failed to fetch QuickNode tokens', 'QUICKNODE_FETCH_ERROR', 'quicknode');
        }
    }
    static async getCoinGeckoTokens(limit = 50) {
        try {
            const marketData = await CoinGeckoService_1.CoinGeckoService.getMarketData({
                perPage: limit,
                sparkline: true,
                priceChangePercentage: ['24h'],
                order: 'market_cap_desc'
            });
            if (!(marketData === null || marketData === void 0 ? void 0 : marketData.length)) {
                throw new TokenServiceError('No token data available from CoinGecko', 'COINGECKO_NO_DATA', 'coingecko');
            }
            return marketData.map(token => {
                var _a;
                return ({
                    id: token.id,
                    symbol: token.symbol.toUpperCase(),
                    name: token.name,
                    current_price: token.current_price || 0,
                    market_cap: token.market_cap || 0,
                    market_cap_rank: token.market_cap_rank || 0,
                    price_change_percentage_24h: token.price_change_percentage_24h_in_currency || 0,
                    volume_24h: token.total_volume || 0,
                    liquidity_usd: (token.total_volume || 0) / 24, // Approximate daily liquidity
                    sparkline_7d: ((_a = token.sparkline_in_7d) === null || _a === void 0 ? void 0 : _a.price) || [],
                    imageUrl: token.image || '',
                    source: 'coingecko',
                    verified: true,
                    info: {
                        imageUrl: token.image || '',
                        source: 'coingecko',
                        verified: true
                    }
                });
            });
        }
        catch (error) {
            if (error instanceof TokenServiceError) {
                throw error;
            }
            throw new TokenServiceError('Failed to fetch CoinGecko tokens', 'COINGECKO_FETCH_ERROR', 'coingecko');
        }
    }
    /**
     * Fetches prices for multiple tokens in a single request
     * @param addresses Array of token addresses
     * @returns Array of token prices with market data
     */
    static async getBatchTokenPrices(addresses) {
        try {
            const tokenPrices = await CoinGeckoService_1.CoinGeckoService.getTokenPrices('solana', addresses, {
                includeMarketCap: true,
                include24hVol: true,
                include24hChange: true,
                includeLastUpdated: true,
                precision: 8
            });
            return Object.entries(tokenPrices).map(([address, data]) => ({
                id: address,
                symbol: 'UNKNOWN', // Basic info not available in simple endpoint
                name: 'Unknown Token',
                current_price: data.usd,
                market_cap: data.usd_market_cap || 0,
                market_cap_rank: 0,
                price_change_percentage_24h: data.usd_24h_change || 0,
                volume_24h: data.usd_24h_vol || 0,
                liquidity_usd: (data.usd_24h_vol || 0) / 24, // Approximate daily liquidity
                sparkline_7d: [],
                imageUrl: '',
                source: 'coingecko',
                verified: true,
                info: {
                    imageUrl: '',
                    source: 'coingecko',
                    verified: true
                }
            }));
        }
        catch (error) {
            console.error('Error fetching batch token prices:', error);
            throw new TokenServiceError('Failed to fetch batch token prices', 'COINGECKO_BATCH_ERROR', 'coingecko');
        }
    }
    static async getTopTokens(limit = 50) {
        try {
            // First get the top tokens list from CoinGecko
            const topTokens = await CoinGeckoService_1.CoinGeckoService.getTopTokens(limit);
            if (!topTokens.length) {
                throw new TokenServiceError('No top tokens found from CoinGecko', 'COINGECKO_NO_DATA', 'coingecko');
            }
            // Extract addresses and fetch fresh price data in batch
            const addresses = topTokens.map(token => token.id);
            const freshPrices = await this.getBatchTokenPrices(addresses);
            // Merge fresh price data with token metadata
            return freshPrices.map((price, index) => ({
                ...price,
                symbol: topTokens[index].symbol,
                name: topTokens[index].name,
                imageUrl: topTokens[index].large || '',
                info: {
                    ...price.info,
                    imageUrl: topTokens[index].large || ''
                }
            }));
        }
        catch (error) {
            console.error('Error fetching top tokens:', error);
            // Try CoinGecko first as it's most reliable for market data
            try {
                const coinGeckoTokens = await this.getCoinGeckoTokens(limit);
                if (coinGeckoTokens.length > 0) {
                    return coinGeckoTokens;
                }
            }
            catch (error) {
                errors.push(error);
                console.error('Error fetching CoinGecko tokens:', error);
            }
            // Fallback to QuickNode
            try {
                const quickNodeTokens = await this.getQuickNodeTokens(limit);
                if (quickNodeTokens.length > 0) {
                    return quickNodeTokens;
                }
            }
            catch (error) {
                errors.push(error);
                console.error('Error fetching QuickNode tokens:', error);
            }
            // If all sources failed, throw a combined error
            if (errors.length === 2) {
                throw new TokenServiceError('All token data sources failed', 'ALL_SOURCES_FAILED');
            }
            return [];
        }
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
    }
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
    static async getTokenChartData(tokenAddress, days, interval) {
        var _a;
        let errors = [];
        // Validate interval based on days
        if (interval === '5m' && days > 10) {
            throw new TokenServiceError('5-minute interval data is only available for the past 10 days', 'INVALID_INTERVAL', 'coingecko');
        }
        if (interval === 'hourly' && days > 100) {
            throw new TokenServiceError('Hourly interval data is only available for the past 100 days', 'INVALID_INTERVAL', 'coingecko');
        }
        try {
            // Get token ID from CoinGecko
            const tokenDetails = await this.fetchCoinGeckoData(tokenAddress);
            if (!(tokenDetails === null || tokenDetails === void 0 ? void 0 : tokenDetails.id)) {
                throw new TokenServiceError('Token not found in CoinGecko', 'TOKEN_NOT_FOUND', 'coingecko');
            }
            // Fetch market chart data
            const response = await CoinGeckoService_1.CoinGeckoService.getTokenMarketChart(tokenDetails.id, days, {
                vs_currency: 'usd',
                interval: interval
            });
            if (!response) {
                throw new TokenServiceError('No chart data available', 'CHART_DATA_UNAVAILABLE', 'coingecko');
            }
            // Validate and transform response
            const chartData = {
                prices: response.prices.map(([timestamp, price]) => [
                    timestamp, // Already in milliseconds
                    Number(price.toFixed(8)) // Normalize precision
                ]),
                market_caps: response.market_caps.map(([timestamp, cap]) => [
                    timestamp,
                    Number(cap.toFixed(2))
                ]),
                total_volumes: response.total_volumes.map(([timestamp, volume]) => [
                    timestamp,
                    Number(volume.toFixed(2))
                ])
            };
            return chartData;
        }
        catch (error) {
            errors.push(error);
        }
        // Try QuickNode as fallback for Solana tokens
        try {
            const response = await QuickNodeService_1.QuickNodeService.getTokenMarketChart(tokenAddress, days);
            if (response) {
                return {
                    prices: response.prices,
                    market_caps: [], // QuickNode doesn't provide market cap data
                    total_volumes: response.total_volumes || []
                };
            }
        }
        catch (error) {
            errors.push(error);
        }
        // If all sources fail, throw an error with details
        throw new TokenServiceError(`Failed to fetch token chart data: ${errors.map(e => e.message).join(', ')}`, 'CHART_DATA_UNAVAILABLE', ((_a = errors[0]) === null || _a === void 0 ? void 0 : _a.name) === 'TokenServiceError' ? 'coingecko' : 'quicknode');
    }
}
exports.TokenService = TokenService;
TokenService.DEFAULT_IMAGE_URL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/{address}/logo.png';
TokenService.FRESHNESS_THRESHOLDS = {
    PRICE: 60 * 1000, // 1 minute
    MARKET_DATA: 5 * 60 * 1000, // 5 minutes
    CHART_DATA: 15 * 60 * 1000 // 15 minutes
};
// Try QuickNode
try {
    const history = await QuickNodeService_1.QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
    if (history.length > 0) {
        return {
            prices: history.map(point => [point.timestamp * 1000, point.price]),
            market_caps: history.map(point => [point.timestamp * 1000, point.price * point.volume]),
            total_volumes: history.map(point => [point.timestamp * 1000, point.volume])
        };
    }
}
catch (error) {
    errors.push(error);
    console.error('Error fetching QuickNode chart data:', error);
}
if (errors.length === 2) {
    throw new TokenServiceError('Failed to fetch chart data from all sources', 'CHART_DATA_UNAVAILABLE');
}
return {
    prices: [],
    market_caps: [],
    total_volumes: []
};
async;
searchTokens(query, string);
Promise < types_1.SearchResult[] > {
    let, errors: Error[] = [],
    if(, query) {
        throw new TokenServiceError('Search query cannot be empty', 'INVALID_QUERY');
    }
    // Try CoinGecko first for better market data
    ,
    // Try CoinGecko first for better market data
    try: {
        const: coinGeckoResults = await CoinGeckoService_1.CoinGeckoService.searchTokens(query),
        if(coinGeckoResults, length) { }
    } > 0
};
{
    return coinGeckoResults.map(token => ({
        id: token.id,
        name: token.name || 'Unknown Token',
        symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
        market_cap_rank: token.market_cap_rank || 0,
        thumb: token.image || `https://assets.coingecko.com/coins/images/small/${token.id}.png`,
        large: token.image || `https://assets.coingecko.com/coins/images/large/${token.id}.png`
    }));
}
try { }
catch (error) {
    errors.push(error);
    console.error('Error searching tokens in CoinGecko:', error);
}
// Try Birdeye
try {
    const birdeyeResults = await BirdeyeService.searchTokens(query);
    if ((birdeyeResults === null || birdeyeResults === void 0 ? void 0 : birdeyeResults.success) && ((_b = (_a = birdeyeResults.data) === null || _a === void 0 ? void 0 : _a.tokens) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        return birdeyeResults.data.tokens.map(token => ({
            id: token.address,
            name: token.name || 'Unknown Token',
            symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
            market_cap_rank: 0,
            thumb: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address),
            large: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address)
        }));
    }
}
catch (error) {
    errors.push(error);
    console.error('Error searching tokens in Birdeye:', error);
}
// Try QuickNode
try {
    const searchResults = await QuickNodeService_1.QuickNodeService.searchTokens(query);
    if ((searchResults === null || searchResults === void 0 ? void 0 : searchResults.length) > 0) {
        return searchResults.map(token => ({
            id: token.address,
            name: token.name || 'Unknown Token',
            symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
            market_cap_rank: 0,
            thumb: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address),
            large: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address)
        }));
    }
}
catch (error) {
    errors.push(error);
    console.error('Error searching tokens in QuickNode:', error);
}
// If all sources failed, throw a combined error
if (errors.length === 3) {
    throw new TokenServiceError('Failed to search tokens from all sources', 'SEARCH_FAILED');
}
return [];
//# sourceMappingURL=TokenService.js.map