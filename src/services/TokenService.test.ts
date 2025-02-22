import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TokenService } from './TokenService';
import { CoinGeckoService } from './CoinGeckoService';
import { BirdeyeService } from './BirdeyeService';
import { QuickNodeService } from './QuickNodeService';
import { TokenServiceError } from './TokenService';

jest.mock('./CoinGeckoService');
jest.mock('./BirdeyeService');
jest.mock('./QuickNodeService');

const VALID_SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenDetails', () => {
    it('should throw error for invalid address', async () => {
      await expect(TokenService.getTokenDetails('invalid'))
        .rejects
        .toThrow('Invalid Solana token address');
    });

    it('should return CoinGecko data when available', async () => {
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

      jest.spyOn(CoinGeckoService, 'getTokenByAddress')
        .mockResolvedValue(mockToken);

      const result = await TokenService.getTokenDetails(VALID_SOLANA_ADDRESS);

      expect(result.name).toBe('Test Token');
      expect(result.symbol).toBe('TEST');
      expect(result.market_data.current_price.usd).toBe(1);
    });

    it('should fallback to Birdeye when CoinGecko fails', async () => {
      jest.spyOn(CoinGeckoService, 'getTokenByAddress')
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

      jest.spyOn(BirdeyeService, 'getTokenInfo')
        .mockResolvedValue(mockBirdeyeToken);

      const result = await TokenService.getTokenDetails(VALID_SOLANA_ADDRESS);

      expect(result.name).toBe('Test Token');
      expect(result.symbol).toBe('TEST');
      expect(result.market_data.current_price.usd).toBe(1);
    });

    it('should return default token details when all sources fail', async () => {
      jest.spyOn(CoinGeckoService, 'getTokenByAddress')
        .mockRejectedValue(new Error('Not found'));
      jest.spyOn(BirdeyeService, 'getTokenInfo')
        .mockRejectedValue(new Error('API error'));
      jest.spyOn(QuickNodeService, 'getTokenInfo')
        .mockRejectedValue(new Error('Service unavailable'));

      const result = await TokenService.getTokenDetails(VALID_SOLANA_ADDRESS);

      expect(result.name).toBe('Unknown Token');
      expect(result.symbol).toBe('UNKNOWN');
    });
  });

  describe('getTokenOHLC', () => {
    it('should return OHLC data from CoinGecko', async () => {
      const mockOHLC = [
        { timestamp: 1000, open: 1, high: 1.1, low: 0.9, close: 1 }
      ];

      jest.spyOn(CoinGeckoService, 'getOHLCData')
        .mockResolvedValue(mockOHLC);

      const result = await TokenService.getTokenOHLC(VALID_SOLANA_ADDRESS, '7');

      expect(result).toHaveLength(1);
      expect(result[0].open).toBe(1);
      expect(result[0].high).toBe(1.1);
    });

    it('should validate days parameter', async () => {
      await expect(TokenService.getTokenOHLC(VALID_SOLANA_ADDRESS, '-1'))
        .rejects
        .toThrow('Invalid days parameter');
    });

    it('should handle missing data gracefully', async () => {
      jest.spyOn(CoinGeckoService, 'getOHLCData')
        .mockResolvedValue([]);
      jest.spyOn(BirdeyeService, 'getPriceHistory')
        .mockResolvedValue({ data: { items: [] } });

      await expect(TokenService.getTokenOHLC(VALID_SOLANA_ADDRESS, '7'))
        .rejects
        .toThrow('No price history data available');
    });
  });

  describe('getMarketChart', () => {
    it('should return market chart data with proper structure', async () => {
      const mockData = {
        prices: [[1000, 1]],
        market_caps: [[1000, 1000000]],
        total_volumes: [[1000, 500000]]
      };

      jest.spyOn(CoinGeckoService, 'getContractMarketChart')
        .mockResolvedValue(mockData);

      const result = await TokenService.getTokenChartData(VALID_SOLANA_ADDRESS, 7);

      expect(result.prices).toHaveLength(1);
      expect(result.market_caps).toHaveLength(1);
      expect(result.total_volumes).toHaveLength(1);
    });
  });

  describe('searchTokens', () => {
    it('should return search results from multiple sources', async () => {
      const mockCoinGeckoResults = [
        { id: 'test-1', name: 'Test 1', symbol: 'TEST1' }
      ];

      jest.spyOn(CoinGeckoService, 'searchSolanaTokens')
        .mockResolvedValue(mockCoinGeckoResults);

      const result = await TokenService.searchTokens('test');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test 1');
    });
  });
});
