"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickNodeService = void 0;
const QUICKNODE_BASE_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();
class QuickNodeError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'QuickNodeError';
    }
}
class QuickNodeService {
    static async makeRequest(method, params) {
        if (!QUICKNODE_BASE_URL) {
            throw new QuickNodeError('QuickNode RPC URL not configured');
        }
        const cacheKey = JSON.stringify({ method, params });
        const cachedData = cache.get(cacheKey);
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return cachedData.data;
        }
        try {
            const response = await fetch(QUICKNODE_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method,
                    params,
                }),
            });
            if (!response.ok) {
                throw new QuickNodeError(`HTTP error: ${response.statusText}`, response.status);
            }
            const data = await response.json();
            if (data.error) {
                throw new QuickNodeError(`RPC error: ${data.error.message}`, data.error.code);
            }
            // Cache successful response
            cache.set(cacheKey, {
                data: data.result,
                timestamp: Date.now(),
            });
            return data.result;
        }
        catch (error) {
            console.error('QuickNode API request error:', error);
            throw error;
        }
    }
    static async getTokenInfo(tokenAddress) {
        var _a;
        const result = await this.makeRequest('qn_getTokenMetadata', [tokenAddress]);
        return {
            address: tokenAddress,
            symbol: result.symbol,
            name: result.name,
            decimals: result.decimals,
            price: ((_a = result.price) === null || _a === void 0 ? void 0 : _a.value) || 0,
            volume24h: result.volume24h || 0,
            priceChange24h: result.priceChange24h || 0,
            marketCap: result.marketCap || 0,
            supply: {
                total: result.totalSupply || 0,
                circulating: result.circulatingSupply || 0,
            },
        };
    }
    static async getTokenPriceHistory(tokenAddress, startTime, endTime) {
        const result = await this.makeRequest('qn_getTokenPriceHistory', [
            tokenAddress,
            {
                startTime,
                endTime,
            },
        ]);
        return result.prices.map((item) => ({
            timestamp: item.timestamp,
            price: item.price,
            volume: item.volume || 0,
        }));
    }
    static async searchTokens(query) {
        const result = await this.makeRequest('qn_searchTokens', [query]);
        return result.tokens.map((token) => {
            var _a;
            return ({
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                decimals: token.decimals,
                price: ((_a = token.price) === null || _a === void 0 ? void 0 : _a.value) || 0,
                volume24h: token.volume24h || 0,
                priceChange24h: token.priceChange24h || 0,
                marketCap: token.marketCap || 0,
                supply: {
                    total: token.totalSupply || 0,
                    circulating: token.circulatingSupply || 0,
                },
            });
        });
    }
}
exports.QuickNodeService = QuickNodeService;
//# sourceMappingURL=QuickNodeService.js.map