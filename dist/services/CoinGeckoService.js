"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinGeckoService = void 0;
const env_1 = require("@/config/env");
class CoinGeckoService {
    /**
     * Fetches token price and optional market data using the simple/token_price endpoint
     * @param platform Platform ID (e.g., 'solana')
     * @param contractAddresses Array of contract addresses
     * @param options Optional parameters for additional data
     */
    static async getTokenPrices(platform, contractAddresses, options = {}) {
        var _a, _b, _c, _d;
        const params = new URLSearchParams({
            'contract_addresses': contractAddresses.join(','),
            'vs_currencies': 'usd',
            'include_market_cap': ((_a = options.includeMarketCap) === null || _a === void 0 ? void 0 : _a.toString()) || 'false',
            'include_24hr_vol': ((_b = options.include24hVol) === null || _b === void 0 ? void 0 : _b.toString()) || 'false',
            'include_24hr_change': ((_c = options.include24hChange) === null || _c === void 0 ? void 0 : _c.toString()) || 'false',
            'include_last_updated_at': ((_d = options.includeLastUpdated) === null || _d === void 0 ? void 0 : _d.toString()) || 'false',
            'precision': (options.precision || 6).toString()
        });
        const response = await fetch(`${this.BASE_URL}/simple/token_price/${platform}?${params}`, { headers: this.HEADERS });
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.statusText}`);
        }
        return await response.json();
    }
    static async makeRequest(endpoint, params = {}) {
        const queryParams = new URLSearchParams(params);
        // Use pro API if key is available, otherwise use free API
        const baseUrl = env_1.COINGECKO_API_KEY ? this.BASE_URL : this.FREE_BASE_URL;
        let url = `${baseUrl}${endpoint}?${queryParams}`;
        if (env_1.COINGECKO_API_KEY) {
            url += `&x_cg_pro_api_key=${env_1.COINGECKO_API_KEY}`;
        }
        const cacheKey = url;
        // Check cache
        const cachedData = this.cache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
            return cachedData.data;
        }
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.statusText}`);
            }
            const data = await response.json();
            // Update cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            return data;
        }
        catch (error) {
            console.error('CoinGecko API request failed:', error);
            throw error;
        }
    }
    static async getTokenInfo(tokenId) {
        return this.makeRequest(`/coins/${tokenId}`, {
            localization: 'false',
            tickers: 'false',
            community_data: 'false',
            developer_data: 'false'
        });
    }
    static async getOHLCData(tokenId, days = 7) {
        const data = await this.makeRequest(`/coins/${tokenId}/ohlc`, { vs_currency: 'usd', days: days.toString() });
        return data.map(([timestamp, open, high, low, close]) => ({
            timestamp,
            open,
            high,
            low,
            close
        }));
    }
    static async searchTokens(query) {
        return this.makeRequest('/search', {
            query,
            platform: 'solana'
        });
    }
    static async getMarketData(options = {}) {
        var _a;
        const params = {
            vs_currency: 'usd',
            platform: this.SOLANA_PLATFORM_ID
        };
        if (options.category) {
            params.category = options.category;
        }
        if (options.order) {
            params.order = options.order;
        }
        if (options.perPage) {
            params.per_page = options.perPage.toString();
        }
        if (options.page) {
            params.page = options.page.toString();
        }
        if (options.sparkline !== undefined) {
            params.sparkline = options.sparkline.toString();
        }
        if ((_a = options.priceChangePercentage) === null || _a === void 0 ? void 0 : _a.length) {
            params.price_change_percentage = options.priceChangePercentage.join(',');
        }
        if (typeof options.precision === 'number') {
            params.precision = options.precision.toString();
        }
        return this.makeRequest('/coins/markets', params);
    }
    static async getTokenMarketData(tokenIds, options = {}) {
        return this.getMarketData({
            ...options,
            ids: tokenIds.join(',')
        });
    }
    static async getTopTokens(limit = 50, options = {}) {
        return this.getMarketData({
            ...options,
            perPage: limit,
            page: 1
        });
    }
    static async getTrendingTokens() {
        const trending = await this.makeRequest('/search/trending');
        const trendingIds = trending.coins.map(coin => coin.item.id);
        return this.getTokenMarketData(trendingIds);
    }
}
exports.CoinGeckoService = CoinGeckoService;
CoinGeckoService.BASE_URL = 'https://pro-api.coingecko.com/api/v3';
CoinGeckoService.HEADERS = {
    'accept': 'application/json',
    'x-cg-pro-api-key': env_1.COINGECKO_API_KEY
};
CoinGeckoService.BASE_URL = 'https://pro-api.coingecko.com/api/v3';
CoinGeckoService.FREE_BASE_URL = 'https://api.coingecko.com/api/v3';
CoinGeckoService.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
CoinGeckoService.SOLANA_PLATFORM_ID = 'solana';
CoinGeckoService.cache = new Map();
//# sourceMappingURL=CoinGeckoService.js.map