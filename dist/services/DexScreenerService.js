"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexScreenerService = void 0;
const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();
class DexScreenerService {
    static async makeRequest(endpoint, params = {}) {
        const url = new URL(`${DEXSCREENER_BASE_URL}${endpoint}`);
        // Add query params
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        });
        const cacheKey = url.toString();
        const cachedData = cache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return cachedData.data;
        }
        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`DexScreener API resource not found: ${url.toString()}`);
                    return {};
                }
                console.error('DexScreener API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: url.toString()
                });
                throw new Error(`DexScreener API request failed: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        }
        catch (error) {
            console.error('DexScreener API request error:', error);
            throw error;
        }
    }
    static async getTokenProfile(chainId, tokenAddress) {
        return this.makeRequest(`/token-profiles/latest/v1/${chainId}/${tokenAddress}`);
    }
    static async getTokenPairs(chainId, tokenAddress) {
        return this.makeRequest(`/token-pairs/v1/${chainId}/${tokenAddress}`);
    }
    static async searchPairs(query) {
        return this.makeRequest('/latest/dex/search', { q: query });
    }
    static async getPairsByTokens(chainId, tokenAddresses) {
        if (tokenAddresses.length > 30) {
            throw new Error('Maximum of 30 token addresses allowed');
        }
        return this.makeRequest(`/tokens/v1/${chainId}/${tokenAddresses.join(',')}`);
    }
    static async getPairInfo(chainId, pairId) {
        return this.makeRequest(`/latest/dex/pairs/${chainId}/${pairId}`);
    }
    static async getPairPriceHistory(chainId, pairAddress, timeframe) {
        try {
            // Convert timeframe to hours/days format
            const interval = timeframe === '1' ? '5m' :
                timeframe === '7' ? '1h' :
                    timeframe === '30' ? '4h' : '1d';
            return await this.makeRequest(`/pairs/v1/${chainId}/${pairAddress}/chart`, { interval });
        }
        catch (error) {
            console.error(`Failed to fetch price history for pair ${pairAddress}:`, error);
            // Return empty price history with schema version
            return {
                schemaVersion: '1.0.0',
                candles: []
            };
        }
    }
    // Helper method to get price and liquidity info for a token
    static async getTokenInfo(chainId, tokenAddress) {
        var _a;
        try {
            const pairs = await this.getTokenPairs(chainId, tokenAddress);
            if (!pairs || pairs.length === 0) {
                return {
                    priceUsd: null,
                    liquidity: null,
                    volume24h: null,
                    priceChange24h: null
                };
            }
            // Get the pair with highest liquidity
            const bestPair = pairs.reduce((best, current) => { var _a, _b; return (((_a = current.liquidity) === null || _a === void 0 ? void 0 : _a.usd) || 0) > (((_b = best.liquidity) === null || _b === void 0 ? void 0 : _b.usd) || 0) ? current : best; });
            return {
                priceUsd: bestPair.priceUsd,
                liquidity: ((_a = bestPair.liquidity) === null || _a === void 0 ? void 0 : _a.usd) || null,
                volume24h: Object.values(bestPair.volume || {})[0] || null,
                priceChange24h: Object.values(bestPair.priceChange || {})[0] || null
            };
        }
        catch (error) {
            console.error('Error fetching token info from DexScreener:', error);
            return {
                priceUsd: null,
                liquidity: null,
                volume24h: null,
                priceChange24h: null
            };
        }
    }
}
exports.DexScreenerService = DexScreenerService;
//# sourceMappingURL=DexScreenerService.js.map