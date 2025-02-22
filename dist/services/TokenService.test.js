"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const TokenService_1 = require("./TokenService");
const CoinGeckoService_1 = require("./CoinGeckoService");
const BirdeyeService_1 = require("./BirdeyeService");
const QuickNodeService_1 = require("./QuickNodeService");
globals_1.jest.mock('./CoinGeckoService');
globals_1.jest.mock('./BirdeyeService');
globals_1.jest.mock('./QuickNodeService');
const VALID_SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
(0, globals_1.describe)('TokenService', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.describe)('getTokenDetails', () => {
        (0, globals_1.it)('should throw error for invalid address', async () => {
            await (0, globals_1.expect)(TokenService_1.TokenService.getTokenDetails('invalid'))
                .rejects
                .toThrow('Invalid Solana token address');
        });
        (0, globals_1.it)('should return CoinGecko data when available', async () => {
            const mockToken = {
                id: 'test-token',
                name: 'Test Token',
                symbol: 'TEST',
                image: 'test.png',
                description: { en: 'Test description' },
                market_data: {
                    current_price: { usd: 1 },
                    price_change_percentage_24h: 5,
                    market_cap: { usd: 1000000 },
                    total_volume: { usd: 500000 },
                    high_24h: { usd: 1.1 },
                    low_24h: { usd: 0.9 }
                }
            };
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'getTokenByAddress')
                .mockResolvedValue(mockToken);
            const result = await TokenService_1.TokenService.getTokenDetails(VALID_SOLANA_ADDRESS);
            (0, globals_1.expect)(result.name).toBe('Test Token');
            (0, globals_1.expect)(result.symbol).toBe('TEST');
            (0, globals_1.expect)(result.market_data.current_price.usd).toBe(1);
        });
        (0, globals_1.it)('should fallback to Birdeye when CoinGecko fails', async () => {
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'getTokenByAddress')
                .mockRejectedValue(new Error('Not found'));
            const mockBirdeyeToken = {
                success: true,
                data: {
                    address: VALID_SOLANA_ADDRESS,
                    name: 'Test Token',
                    symbol: 'TEST',
                    price: 1,
                    priceChange24h: 5,
                    marketCap: 1000000,
                    volume24h: 500000,
                    logoURI: 'test.png'
                }
            };
            globals_1.jest.spyOn(BirdeyeService_1.BirdeyeService, 'getTokenInfo')
                .mockResolvedValue(mockBirdeyeToken);
            const result = await TokenService_1.TokenService.getTokenDetails(VALID_SOLANA_ADDRESS);
            (0, globals_1.expect)(result.name).toBe('Test Token');
            (0, globals_1.expect)(result.symbol).toBe('TEST');
            (0, globals_1.expect)(result.market_data.current_price.usd).toBe(1);
        });
        (0, globals_1.it)('should return default token details when all sources fail', async () => {
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'getTokenByAddress')
                .mockRejectedValue(new Error('Not found'));
            globals_1.jest.spyOn(BirdeyeService_1.BirdeyeService, 'getTokenInfo')
                .mockRejectedValue(new Error('API error'));
            globals_1.jest.spyOn(QuickNodeService_1.QuickNodeService, 'getTokenInfo')
                .mockRejectedValue(new Error('Service unavailable'));
            const result = await TokenService_1.TokenService.getTokenDetails(VALID_SOLANA_ADDRESS);
            (0, globals_1.expect)(result.name).toBe('Unknown Token');
            (0, globals_1.expect)(result.symbol).toBe('UNKNOWN');
        });
    });
    (0, globals_1.describe)('getTokenOHLC', () => {
        (0, globals_1.it)('should return OHLC data from CoinGecko', async () => {
            const mockOHLC = [
                { timestamp: 1000, open: 1, high: 1.1, low: 0.9, close: 1 }
            ];
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'getOHLCData')
                .mockResolvedValue(mockOHLC);
            const result = await TokenService_1.TokenService.getTokenOHLC(VALID_SOLANA_ADDRESS, '7');
            (0, globals_1.expect)(result).toHaveLength(1);
            (0, globals_1.expect)(result[0].open).toBe(1);
            (0, globals_1.expect)(result[0].high).toBe(1.1);
        });
        (0, globals_1.it)('should validate days parameter', async () => {
            await (0, globals_1.expect)(TokenService_1.TokenService.getTokenOHLC(VALID_SOLANA_ADDRESS, '-1'))
                .rejects
                .toThrow('Invalid days parameter');
        });
        (0, globals_1.it)('should handle missing data gracefully', async () => {
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'getOHLCData')
                .mockResolvedValue([]);
            globals_1.jest.spyOn(BirdeyeService_1.BirdeyeService, 'getPriceHistory')
                .mockResolvedValue({ data: { items: [] } });
            await (0, globals_1.expect)(TokenService_1.TokenService.getTokenOHLC(VALID_SOLANA_ADDRESS, '7'))
                .rejects
                .toThrow('No price history data available');
        });
    });
    (0, globals_1.describe)('getMarketChart', () => {
        (0, globals_1.it)('should return market chart data with proper structure', async () => {
            const mockData = {
                prices: [[1000, 1]],
                market_caps: [[1000, 1000000]],
                total_volumes: [[1000, 500000]]
            };
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'getContractMarketChart')
                .mockResolvedValue(mockData);
            const result = await TokenService_1.TokenService.getTokenChartData(VALID_SOLANA_ADDRESS, 7);
            (0, globals_1.expect)(result.prices).toHaveLength(1);
            (0, globals_1.expect)(result.market_caps).toHaveLength(1);
            (0, globals_1.expect)(result.total_volumes).toHaveLength(1);
        });
    });
    (0, globals_1.describe)('searchTokens', () => {
        (0, globals_1.it)('should return search results from multiple sources', async () => {
            const mockCoinGeckoResults = [
                { id: 'test-1', name: 'Test 1', symbol: 'TEST1' }
            ];
            globals_1.jest.spyOn(CoinGeckoService_1.CoinGeckoService, 'searchSolanaTokens')
                .mockResolvedValue(mockCoinGeckoResults);
            const result = await TokenService_1.TokenService.searchTokens('test');
            (0, globals_1.expect)(result).toHaveLength(1);
            (0, globals_1.expect)(result[0].name).toBe('Test 1');
        });
    });
});
//# sourceMappingURL=TokenService.test.js.map