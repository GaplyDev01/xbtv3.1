const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}

interface TokenPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  priceNative: string;
  priceUsd: string;
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  labels: string[];
  volume: Record<string, number>;
  priceChange: Record<string, number>;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  boosts?: {
    active: number;
  };
  txns: Record<string, {
    buys: number;
    sells: number;
  }>;
  info?: {
    imageUrl: string;
    websites?: Array<{ url: string }>;
    socials?: Array<{
      platform: string;
      handle: string;
    }>;
  };
}

interface PriceCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceHistory {
  schemaVersion: string;
  candles: PriceCandle[];
}

interface SearchResponse {
  schemaVersion: string;
  pairs: TokenPair[];
}

export class DexScreenerService {
  private static async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
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
          return {} as T;
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
    } catch (error) {
      console.error('DexScreener API request error:', error);
      throw error;
    }
  }

  static async getTokenProfile(chainId: string, tokenAddress: string): Promise<TokenProfile> {
    return this.makeRequest<TokenProfile>(`/token-profiles/latest/v1/${chainId}/${tokenAddress}`);
  }

  static async getTokenPairs(chainId: string, tokenAddress: string): Promise<TokenPair[]> {
    return this.makeRequest<TokenPair[]>(`/token-pairs/v1/${chainId}/${tokenAddress}`);
  }

  static async searchPairs(query: string): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>('/latest/dex/search', { q: query });
  }

  static async getPairsByTokens(chainId: string, tokenAddresses: string[]): Promise<TokenPair[]> {
    if (tokenAddresses.length > 30) {
      throw new Error('Maximum of 30 token addresses allowed');
    }
    return this.makeRequest<TokenPair[]>(`/tokens/v1/${chainId}/${tokenAddresses.join(',')}`);
  }

  static async getPairInfo(chainId: string, pairId: string): Promise<SearchResponse> {
    return this.makeRequest<SearchResponse>(`/latest/dex/pairs/${chainId}/${pairId}`);
  }

  static async getPairPriceHistory(chainId: string, pairAddress: string, timeframe: string): Promise<PriceHistory> {
    try {
      // Convert timeframe to hours/days format
      const interval = timeframe === '1' ? '5m' : 
                      timeframe === '7' ? '1h' : 
                      timeframe === '30' ? '4h' : '1d';
      
      return await this.makeRequest<PriceHistory>(`/pairs/v1/${chainId}/${pairAddress}/chart`, { interval });
    } catch (error) {
      console.error(`Failed to fetch price history for pair ${pairAddress}:`, error);
      // Return empty price history with schema version
      return {
        schemaVersion: '1.0.0',
        candles: []
      };
    }
  }

  // Helper method to get price and liquidity info for a token
  static async getTokenInfo(chainId: string, tokenAddress: string): Promise<{
    priceUsd: string | null;
    liquidity: number | null;
    volume24h: number | null;
    priceChange24h: number | null;
  }> {
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
      const bestPair = pairs.reduce((best, current) => 
        (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
      );

      return {
        priceUsd: bestPair.priceUsd,
        liquidity: bestPair.liquidity?.usd || null,
        volume24h: Object.values(bestPair.volume || {})[0] || null,
        priceChange24h: Object.values(bestPair.priceChange || {})[0] || null
      };
    } catch (error) {
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
