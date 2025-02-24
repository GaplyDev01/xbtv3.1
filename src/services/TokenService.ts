import { BitqueryService } from './BitqueryService';
import { solanaAddressSchema } from './validators';

/**
 * Custom error class for token-related errors
 */
export class TokenServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public source?: 'bitquery'
  ) {
    super(message);
    this.name = 'TokenServiceError';
  }
}

/** Interface for token price information */
export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  price_change_percentage_24h: number;
  volume_24h: number;
  imageUrl: string;
  source: 'bitquery';
  verified: boolean;
}

/** Interface for token chart data */
export interface TokenChartData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][]; // [timestamp, marketCap]
  total_volumes: [number, number][]; // [timestamp, volume]
}

/** Interface for search results */
export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

/** Service class for managing token-related operations */
export class TokenService {
  private static readonly DEFAULT_IMAGE_URL = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/{address}/logo.png';

  /**
   * Search for tokens based on a query string
   */
  static async searchTokens(query: string): Promise<SearchResult[]> {
    if (!query) {
      throw new TokenServiceError(
        'Search query cannot be empty',
        'INVALID_QUERY'
      );
    }

    try {
      const tokens = await BitqueryService.searchTokens(query);
      return tokens.map(token => ({
        id: token.mintAddress,
        name: token.name || 'Unknown Token',
        symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
        market_cap_rank: 0,
        thumb: TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.mintAddress),
        large: TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.mintAddress)
      }));
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw new TokenServiceError(
        'Failed to search tokens',
        'SEARCH_ERROR',
        'bitquery'
      );
    }
  }

  /**
   * Get token details including price and market data
   */
  static async getTokenDetails(address: string): Promise<TokenPrice> {
    try {
      const validAddress = solanaAddressSchema.parse(address);
      const tokenData = await BitqueryService.getTokenPrice(validAddress);

      return {
        id: address,
        symbol: tokenData.symbol || 'UNKNOWN',
        name: tokenData.name || 'Unknown Token',
        current_price: tokenData.priceUSD,
        market_cap: tokenData.marketCap,
        volume_24h: tokenData.volume24h,
        price_change_percentage_24h: 0, // Not available in basic Bitquery data
        imageUrl: TokenService.DEFAULT_IMAGE_URL.replace('{address}', address),
        source: 'bitquery',
        verified: true
      };
    } catch (error) {
      console.error('Error fetching token details:', error);
      throw new TokenServiceError(
        'Failed to fetch token details',
        'TOKEN_DETAILS_ERROR',
        'bitquery'
      );
    }
  }

  /**
   * Get historical chart data for a token
   */
  static async getTokenChartData(
    tokenAddress: string,
    days: number
  ): Promise<TokenChartData> {
    try {
      const history = await BitqueryService.getTokenPriceHistory(tokenAddress, days);
      
      return {
        prices: history.map(point => [new Date(point.time).getTime(), point.price]),
        market_caps: history.map(point => [new Date(point.time).getTime(), point.price * point.volume]),
        total_volumes: history.map(point => [new Date(point.time).getTime(), point.volume])
      };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw new TokenServiceError(
        'Failed to fetch chart data',
        'CHART_DATA_ERROR',
        'bitquery'
      );
    }
  }
}
