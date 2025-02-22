import { CoinGeckoService } from './CoinGeckoService';
import { solanaAddressSchema } from './validators';
import {
  TokenPrice,
  TokenMarketData,
  TokenChartData,
  SearchResult,
  TokenDetails,
} from './types';

/**
 * Custom error class for token-related errors
 */
export class TokenServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public source?: 'coingecko' | 'token-service',
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TokenServiceError';
  }
}

export type MarketChartData = TokenChartData;

export class TokenService {
  private static readonly DEFAULT_IMAGE_URL = 'https://assets.coingecko.com/coins/images/large/missing_large.png';
  private static readonly FRESHNESS_THRESHOLDS = {
    PRICE: 60 * 1000,        // 1 minute
    MARKET_DATA: 5 * 60 * 1000, // 5 minutes
    CHART_DATA: 15 * 60 * 1000  // 15 minutes
  };


  /**
   * Search for tokens using CoinGecko API
   * @param query Search query string
   * @returns Array of search results
   */
  static async searchTokens(query: string): Promise<SearchResult[]> {
    if (!query?.trim()) {
      throw new TokenServiceError(
        'Search query cannot be empty',
        'INVALID_QUERY'
      );
    }

    try {
      const results = await CoinGeckoService.searchTokens(query);
      
      if (!results?.length) {
        return [];
      }

      return results.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        market_cap_rank: coin.market_cap_rank,
        thumb: coin.image || TokenService.DEFAULT_IMAGE_URL,
        large: coin.image || TokenService.DEFAULT_IMAGE_URL
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new TokenServiceError(
        `Token search failed: ${errorMessage}`,
        'SEARCH_FAILED',
        'coingecko',
        error instanceof Error ? error : undefined
      );
    }
  }


  private static readonly DEFAULT_IMAGE_URL = 'https://assets.coingecko.com/coins/images/large/missing_large.png';
  private static readonly FRESHNESS_THRESHOLDS = {
    PRICE: 60 * 1000,        // 1 minute
    MARKET_DATA: 5 * 60 * 1000, // 5 minutes
    CHART_DATA: 15 * 60 * 1000  // 15 minutes
  };

  private static async fetchCoinGeckoData(address: string): Promise<TokenDetails | null> {
    try {
      // Get token price and market data using the simple/token_price endpoint
      const tokenPrices = await CoinGeckoService.getTokenPrices('solana', [address], {
        includeMarketCap: true,
        include24hVol: true,
        include24hChange: true,
        includeLastUpdated: true,
        precision: 8
      });

      const tokenData = tokenPrices[address.toLowerCase()];
      if (!tokenData) return null;

      // Get additional token info for metadata
      const tokenInfo = await CoinGeckoService.getTokenInfo(address);
      return {
        id: address,
        name: tokenInfo?.name || 'Unknown Token',
        symbol: tokenInfo?.symbol || 'UNKNOWN',
        image: {
          large: tokenInfo?.image || '',
          small: tokenInfo?.image || '',
          thumb: tokenInfo?.image || ''
        },
        market_data: {
          current_price: { usd: tokenData.usd },
          price_change_percentage_24h: tokenData.usd_24h_change || 0,
          market_cap: { usd: tokenData.usd_market_cap || 0 },
          total_volume: { usd: tokenData.usd_24h_vol || 0 },
          high_24h: { usd: 0 }, // Not available in simple endpoint
          low_24h: { usd: 0 }  // Not available in simple endpoint
        },
        description: { en: '' },
        last_updated_at: tokenData.last_updated_at || Math.floor(Date.now() / 1000)
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new TokenServiceError(
        `Failed to fetch CoinGecko data: ${errorMessage}`,
        'COINGECKO_FETCH_ERROR',
        'coingecko'
      );
    }
  }

  private static getDefaultTokenDetails(address: string): TokenDetails {
    const imageUrl = this.DEFAULT_IMAGE_URL;
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
      description: { en: '' },
      last_updated_at: Math.floor(Date.now() / 1000)
    };
  }

  static async getTokenDetails(address: string): Promise<TokenDetails> {
    // Input validation
    const addressResult = solanaAddressSchema.safeParse(address);
    if (!addressResult.success) {
      throw new TokenServiceError(
        'Invalid Solana token address',
        'INVALID_ADDRESS'
      );
    }

    try {
      const coinGeckoData = await TokenService.fetchCoinGeckoData(address);
      if (coinGeckoData) return coinGeckoData;
      
      return this.getDefaultTokenDetails(address);
    } catch (error) {
      console.error('Error fetching token details:', error);
      
      if (error instanceof TokenServiceError) {
        throw error;
      }
      
      throw new TokenServiceError(
        'Failed to fetch token details',
        'FETCH_ERROR',
        'coingecko',
        error instanceof Error ? error : undefined
      );
    }
  }

  public static async getTokenChartData(
    tokenAddress: string,
    days: number | 'max',
    interval?: '5m' | 'hourly' | 'daily'
  ): Promise<TokenChartData> {
    try {
      const tokenDetails = await this.getTokenDetails(tokenAddress);
      
      const response = await CoinGeckoService.getTokenMarketChart(
        tokenDetails.id,
        days,
        {
          vs_currency: 'usd',
          interval: interval
        }
      );

      if (!response?.prices?.length) {
        throw new TokenServiceError(
          'No chart data available',
          'CHART_DATA_UNAVAILABLE',
          'coingecko'
        );
      }

      // Normalize the data
      return {
        prices: response.prices.map(([timestamp, price]: [number, number]) => [
          timestamp,
          Number(price.toFixed(8))
        ]),
        market_caps: response.market_caps.map(([timestamp, cap]: [number, number]) => [
          timestamp,
          Number(cap.toFixed(2))
        ]),
        total_volumes: response.total_volumes.map(([timestamp, volume]: [number, number]) => [
          timestamp,
          Number(volume.toFixed(2))
        ])
      };
    } catch (error) {
      throw new TokenServiceError(
        'Failed to fetch token chart data',
        'CHART_DATA_UNAVAILABLE',
        'coingecko',
        error instanceof Error ? error : undefined
      );
    }
  }
}
