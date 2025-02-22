import { BirdeyeService } from './BirdeyeService';
import { QuickNodeService } from './QuickNodeService';
import { CoinGeckoService } from './CoinGeckoService';
import { solanaAddressSchema, tokenDetailsSchema } from './validators';

/**
 * Custom error class for token-related errors
 */
export class TokenServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public source?: 'coingecko' | 'birdeye' | 'quicknode'
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
  liquidity_usd: number;
  sparkline_7d?: number[];
  imageUrl: string;
  source: 'coingecko' | 'birdeye' | 'quicknode';
  verified: boolean;
  info: {
    imageUrl: string;
    source: 'coingecko' | 'birdeye' | 'quicknode';
    verified: boolean;
  };
}

/** Interface for token chart data */
export interface TokenChartData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][]; // [timestamp, marketCap]
  total_volumes: [number, number][]; // [timestamp, volume]
  liquidity?: [number, number][]; // [timestamp, liquidity_usd]
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

/** Interface for token details */
export interface TokenDetails {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
  };
  description: { en: string };
}

/** Interface for price history data */
interface BirdeyePriceItem {
  unixTime: number;
  value: number;
}

interface PriceHistoryItem extends OHLCData {}

/** Interface for OHLC data */
export interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Service class for managing token-related operations */
export type MarketChartData = TokenChartData;

export class TokenService {
  /** Default image URL pattern for tokens */
  private static readonly DEFAULT_IMAGE_URL = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/assets/{address}/logo.png';
  
  /** Minimum data freshness thresholds in milliseconds */
  private static async fetchCoinGeckoData(address: string): Promise<TokenDetails | null> {
    try {
      const tokenInfo = await CoinGeckoService.getTokenInfo(address);
      if (!tokenInfo) return null;
      
      return {
        id: tokenInfo.id,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        image: {
          large: tokenInfo.image || '',
          small: tokenInfo.image || '',
          thumb: tokenInfo.image || ''
        },
        market_data: {
          current_price: { usd: tokenInfo.current_price },
          price_change_percentage_24h: tokenInfo.price_change_percentage_24h,
          market_cap: { usd: tokenInfo.market_cap },
          total_volume: { usd: tokenInfo.total_volume },
          high_24h: { usd: tokenInfo.high_24h || 0 },
          low_24h: { usd: tokenInfo.low_24h || 0 }
        },
        description: { en: '' }
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

  private static async fetchBirdeyeData(address: string): Promise<TokenDetails | null> {
    try {
      const response = await BirdeyeService.getTokenInfo(address);
      if (!response.success || !response.data) return null;
      
      const tokenInfo = response.data;
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new TokenServiceError(
        `Failed to fetch Birdeye data: ${errorMessage}`,
        'BIRDEYE_FETCH_ERROR',
        'birdeye'
      );
    }
  }

  private static async fetchQuickNodeData(address: string): Promise<TokenDetails | null> {
    try {
      const tokenInfo = await QuickNodeService.getTokenInfo(address);
      if (!tokenInfo) return null;
      
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new TokenServiceError(
        `Failed to fetch QuickNode data: ${errorMessage}`,
        'QUICKNODE_FETCH_ERROR',
        'quicknode'
      );
    }
  }

  private static readonly FRESHNESS_THRESHOLDS = {
    PRICE: 60 * 1000,        // 1 minute
    MARKET_DATA: 5 * 60 * 1000, // 5 minutes
    CHART_DATA: 15 * 60 * 1000  // 15 minutes
  };

  /**
   * Creates default token details for a given address
   * @param address - Token contract address
   * @returns Default token details object
   */
  private static getDefaultTokenDetails(address: string): TokenDetails {
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
  static async getTokenDetails(address: string): Promise<TokenDetails> {
    // Input validation
    const addressResult = solanaAddressSchema.safeParse(address);
    if (!addressResult.success) {
      throw new TokenServiceError(
        'Invalid Solana token address',
        'INVALID_ADDRESS'
      );
    }

    let tokenDetails = this.getDefaultTokenDetails(address);
    let errors: Error[] = [];

    try {
      // Try CoinGecko first for most comprehensive data
      try {
        const coinGeckoData = await TokenService.fetchCoinGeckoData(address);
        if (coinGeckoData) return coinGeckoData;
      } catch (error) {
        errors.push(error as Error);
      }

      // Try Birdeye as fallback for Solana-specific data
      try {
        const birdeyeData = await TokenService.fetchBirdeyeData(address);
        if (birdeyeData) return birdeyeData;
      } catch (error) {
        errors.push(error as Error);
      }

      // Last resort: QuickNode
      try {
        const quickNodeData = await TokenService.fetchQuickNodeData(address);
        if (quickNodeData) return quickNodeData;
      } catch (error) {
        errors.push(error as Error);
      }

      // If all sources failed with actual errors (not just missing data)
      if (errors.length === 3) {
        throw new TokenServiceError(
          'All data sources failed',
          'DATA_SOURCES_FAILED',
          undefined
        );
      }

      return tokenDetails;
    } catch (error) {
      console.error('Error fetching token details:', error);
      
      if (error instanceof TokenServiceError) {
        throw error;
      }
      
      throw new TokenServiceError(
        'Failed to fetch token details',
        'UNKNOWN_ERROR',
        undefined
      );
    }
  }

  static async getMarketChart(tokenAddress: string, days: string | number): Promise<MarketChartData> {
    try {
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (typeof days === 'string' ? parseInt(days) : days) * 24 * 60 * 60;
      
      const history = await QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
      
      return {
        prices: history.map(point => [point.timestamp * 1000, point.price]),
        market_caps: history.map(point => [point.timestamp * 1000, point.price * point.volume]), // Approximate
        total_volumes: history.map(point => [point.timestamp * 1000, point.volume])
      };
    } catch (error) {
      console.error('Error fetching market chart:', error);
      throw error;
    }
  }

  static async getTokenOHLC(tokenAddress: string, days: string = '30', interval?: string): Promise<OHLCData[]> {
    try {
      // Try CoinGecko first
      try {
        const coinGeckoData = await CoinGeckoService.getOHLCData(tokenAddress, parseInt(days));
        if (coinGeckoData.length > 0) {
          return coinGeckoData.map(data => ({
            time: data.timestamp,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close
          }));
        }
      } catch (coinGeckoError) {
        console.error('Error fetching CoinGecko OHLC data:', coinGeckoError);
      }

      // Try QuickNode
      try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (parseInt(days) * 24 * 60 * 60);
        const quickNodeData = await QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
        
        if (quickNodeData.length > 0) {
          return quickNodeData.map((point: { timestamp: number; price: number; volume: number }) => ({
            time: point.timestamp * 1000,
            open: point.price,
            high: point.price,
            low: point.price,
            close: point.price
          }));
        }
      } catch (quickNodeError) {
        console.error('Error fetching QuickNode OHLC data:', quickNodeError);
      }

      // Fallback to Birdeye
      try {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (parseInt(days) * 24 * 60 * 60);
        const birdeyeData = await BirdeyeService.getPriceHistory(tokenAddress, startTime, endTime);
        if (birdeyeData.data?.items?.length > 0) {
          return birdeyeData.data.items.map(point => ({
            time: point.unixTime * 1000,
            open: point.value,
            high: point.value,
            low: point.value,
            close: point.value
          }));
        }
      } catch (birdeyeError) {
        console.error('Error fetching Birdeye OHLC data:', birdeyeError);
      }

      throw new Error('No price history data available from any source');
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
      throw error;
    }
  }

  static async getTokenMarketChart(tokenAddress: string, days: string | number = '30', interval?: string): Promise<MarketChartData> {
    try {
      // Try CoinGecko first
      try {
        const coinGeckoData = await CoinGeckoService.getMarketData({
          ids: tokenAddress,
          perPage: 1,
          sparkline: true
        });
        if (coinGeckoData.length > 0) {
          return {
            prices: coinGeckoData[0].sparkline_in_7d?.price?.map((price, i) => [Date.now() - (7 - i/24) * 24 * 60 * 60 * 1000, price]) || [],
            market_caps: [],
            total_volumes: []
          };
        }
      } catch (error) {
        console.error('Error fetching CoinGecko market chart:', error);
      }

      // Fallback to QuickNode
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = endTime - (typeof days === 'string' ? parseInt(days) : days) * 24 * 60 * 60;
      
      const history = await QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
      
      return {
        prices: history.map(point => [point.timestamp * 1000, point.price]),
        market_caps: history.map(point => [point.timestamp * 1000, point.price * point.volume]), // Approximate
        total_volumes: history.map(point => [point.timestamp * 1000, point.volume])
      };
    } catch (error) {
      console.error('Error fetching token market chart:', error);
      throw error;
    }
  }

  private static async getQuickNodeTokens(limit: number = 50): Promise<TokenPrice[]> {
    try {
      const tokens = await QuickNodeService.searchTokens('SOL');
      if (!tokens?.length) {
        throw new TokenServiceError(
          'No token data available from QuickNode',
          'QUICKNODE_NO_DATA',
          'quicknode'
        );
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
        source: 'quicknode' as const,
        verified: true,
        info: {
          imageUrl: token.logoURI || '',
          source: 'quicknode' as const,
          verified: true
        }
      }));
    } catch (error) {
      if (error instanceof TokenServiceError) {
        throw error;
      }
      throw new TokenServiceError(
        'Failed to fetch QuickNode tokens',
        'QUICKNODE_FETCH_ERROR',
        'quicknode'
      );
    }
  }

  private static async getCoinGeckoTokens(limit: number = 50): Promise<TokenPrice[]> {
    try {
      const marketData = await CoinGeckoService.getMarketData({
        perPage: limit,
        sparkline: true,
        priceChangePercentage: ['24h'],
        order: 'market_cap_desc'
      });

      if (!marketData?.length) {
        throw new TokenServiceError(
          'No token data available from CoinGecko',
          'COINGECKO_NO_DATA',
          'coingecko'
        );
      }

      return marketData.map(token => ({
        id: token.id,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        current_price: token.current_price || 0,
        market_cap: token.market_cap || 0,
        market_cap_rank: token.market_cap_rank || 0,
        price_change_percentage_24h: token.price_change_percentage_24h_in_currency || 0,
        volume_24h: token.total_volume || 0,
        liquidity_usd: (token.total_volume || 0) / 24, // Approximate daily liquidity
        sparkline_7d: token.sparkline_in_7d?.price || [],
        imageUrl: token.image || '',
        source: 'coingecko' as const,
        verified: true,
        info: {
          imageUrl: token.image || '',
          source: 'coingecko' as const,
          verified: true
        }
      }));
    } catch (error) {
      if (error instanceof TokenServiceError) {
        throw error;
      }
      throw new TokenServiceError(
        'Failed to fetch CoinGecko tokens',
        'COINGECKO_FETCH_ERROR',
        'coingecko'
      );
    }
  }

  private static async getBirdEyeTokens(limit: number = 50): Promise<TokenPrice[]> {
    try {
      const response = await BirdeyeService.getTopTokens(limit);
      if (!response?.data?.tokens) return [];
      
      return response.data.tokens.map(token => ({
        id: token.address,
        symbol: token.symbol,
        name: token.name,
        current_price: token.price,
        market_cap: token.marketCap,
        market_cap_rank: 0,
        price_change_percentage_24h: token.priceChange24h || 0,
        volume_24h: token.volume24h || 0,
        liquidity_usd: 0,
        sparkline_7d: [],
        imageUrl: token.logoURI || '',
        source: 'birdeye' as const,
        verified: false,
        info: {
          imageUrl: token.logoURI || '',
          source: 'birdeye' as const,
          verified: false
        }
      }));
    } catch (error) {
      console.error('Error fetching Birdeye tokens:', error);
      throw new TokenServiceError(
        'Failed to fetch Birdeye tokens',
        'BIRDEYE_FETCH_ERROR',
        'birdeye'
      );
    }
  }

  static async getTopTokens(limit: number = 50): Promise<TokenPrice[]> {
    let errors: Error[] = [];

    // Try CoinGecko first as it's most reliable for market data
    try {
      const coinGeckoTokens = await this.getCoinGeckoTokens(limit);
      if (coinGeckoTokens.length > 0) {
        return coinGeckoTokens;
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error fetching CoinGecko tokens:', error);
    }

    // Fallback to QuickNode
    try {
      const quickNodeTokens = await this.getQuickNodeTokens(limit);
      if (quickNodeTokens.length > 0) {
        return quickNodeTokens;
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error fetching QuickNode tokens:', error);
    }

    // Last resort: Birdeye
    try {
      const birdeyeTokens = await this.getBirdEyeTokens(limit);
      if (birdeyeTokens.length > 0) {
        return birdeyeTokens;
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error fetching Birdeye tokens:', error);
    }

    // If all sources failed, throw a combined error
    if (errors.length === 3) {
      throw new TokenServiceError(
        'All token data sources failed',
        'ALL_SOURCES_FAILED'
      );
    }

    return [];
  }

  static async getTokenChartData(
    tokenAddress: string,
    days: number,
    interval?: string
  ): Promise<TokenChartData> {
    let errors: Error[] = [];
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (days * 24 * 60 * 60);

    // Try CoinGecko first
    try {
      const coinGeckoData = await CoinGeckoService.getMarketData({
        ids: tokenAddress,
        perPage: 1,
        sparkline: true,
        precision: 8
      });
      
      if (coinGeckoData && coinGeckoData.length > 0 && coinGeckoData[0].sparkline_in_7d?.price) {
        const prices = coinGeckoData[0].sparkline_in_7d.price.map((price, index) => {
          const timestamp = Date.now() - ((coinGeckoData[0].sparkline_in_7d!.price.length - index) * 3600 * 1000);
          return [timestamp, price] as [number, number];
        });
        return {
          prices,
          market_caps: [],
          total_volumes: []
        };
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error fetching CoinGecko chart data:', error);
    }

    // Try QuickNode
    try {
      const history = await QuickNodeService.getTokenPriceHistory(tokenAddress, startTime, endTime);
      
      if (history.length > 0) {
        return {
          prices: history.map(point => [point.timestamp * 1000, point.price]),
          market_caps: history.map(point => [point.timestamp * 1000, point.price * point.volume]),
          total_volumes: history.map(point => [point.timestamp * 1000, point.volume])
        };
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error fetching QuickNode chart data:', error);
    }

    // Try Birdeye
    try {
      const birdeyeData = await BirdeyeService.getPriceHistory(tokenAddress, startTime, endTime);
      if (birdeyeData.data?.items?.length > 0) {
        return {
          prices: birdeyeData.data.items.map(point => [point.unixTime * 1000, point.value] as [number, number]),
          market_caps: [],
          total_volumes: []
        };
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error fetching Birdeye chart data:', error);
    }

    if (errors.length === 3) {
      throw new TokenServiceError(
        'Failed to fetch chart data from all sources',
        'CHART_DATA_UNAVAILABLE'
      );
    }

    return {
      prices: [],
      market_caps: [],
      total_volumes: []
    };
  }

  static async searchTokens(query: string): Promise<SearchResult[]> {
    let errors: Error[] = [];

    if (!query) {
      throw new TokenServiceError(
        'Search query cannot be empty',
        'INVALID_QUERY'
      );
    }

    // Try CoinGecko first for better market data
    try {
      const coinGeckoResults = await CoinGeckoService.searchTokens(query);
      if (coinGeckoResults?.length > 0) {
        return coinGeckoResults.map(token => ({
          id: token.id,
          name: token.name || 'Unknown Token',
          symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
          market_cap_rank: token.market_cap_rank || 0,
          thumb: token.image || `https://assets.coingecko.com/coins/images/small/${token.id}.png`,
          large: token.image || `https://assets.coingecko.com/coins/images/large/${token.id}.png`
        }));
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error searching tokens in CoinGecko:', error);
    }

    // Try Birdeye
    try {
      const birdeyeResults = await BirdeyeService.searchTokens(query);
      if (birdeyeResults?.success && birdeyeResults.data?.tokens?.length > 0) {
        return birdeyeResults.data.tokens.map(token => ({
          id: token.address,
          name: token.name || 'Unknown Token',
          symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
          market_cap_rank: 0,
          thumb: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address),
          large: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address)
        }));
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error searching tokens in Birdeye:', error);
    }

    // Try QuickNode
    try {
      const searchResults = await QuickNodeService.searchTokens(query);
      if (searchResults?.length > 0) {
        return searchResults.map(token => ({
          id: token.address,
          name: token.name || 'Unknown Token',
          symbol: (token.symbol || 'UNKNOWN').toUpperCase(),
          market_cap_rank: 0,
          thumb: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address),
          large: token.logoURI || TokenService.DEFAULT_IMAGE_URL.replace('{address}', token.address)
        }));
      }
    } catch (error) {
      errors.push(error as Error);
      console.error('Error searching tokens in QuickNode:', error);
    }

    // If all sources failed, throw a combined error
    if (errors.length === 3) {
      throw new TokenServiceError(
        'Failed to search tokens from all sources',
        'SEARCH_FAILED'
      );
    }

    return [];
  }
}
