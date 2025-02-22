// Always use our API route to handle API key securely
const BIRDEYE_BASE_URL = '/api/birdeye';

const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_REQUESTS_PER_WINDOW = 10;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface RateLimitWindow {
  timestamp: number;
  count: number;
}

class BirdeyeError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'BirdeyeError';
  }
}

const cache = new Map<string, CacheEntry<any>>();
let rateLimitWindow: RateLimitWindow = {
  timestamp: Date.now(),
  count: 0
};

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  marketCap: number;
  supply?: {
    total: number;
    circulating: number;
  };
}

export interface PriceHistoryItem {
  address: string;
  unixTime: number;
  value: number;
}

export interface PriceHistoryResponse {
  data: {
    items: PriceHistoryItem[];
  };
  success: boolean;
}

export interface TokenListResponse {
  data: {
    tokens: TokenInfo[];
  };
  success: boolean;
}

export interface TokenDetailsResponse {
  data: TokenInfo;
  success: boolean;
}

export class BirdeyeService {
  private static checkRateLimit(): void {
    const now = Date.now();
    if (now - rateLimitWindow.timestamp >= RATE_LIMIT_WINDOW) {
      rateLimitWindow = { timestamp: now, count: 0 };
    }
    
    if (rateLimitWindow.count >= MAX_REQUESTS_PER_WINDOW) {
      throw new BirdeyeError(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }
    
    rateLimitWindow.count++;
  }

  private static async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    this.checkRateLimit();
    
    // Construct the path with query parameters
    const searchParams = new URLSearchParams(params);
    const queryString = Object.keys(params).length > 0 ? `?${searchParams.toString()}` : '';
    const path = `${BIRDEYE_BASE_URL}${endpoint}${queryString}`;
    
    // Check cache
    const cacheKey = path;
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      const response = await fetch(path, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Birdeye API error:', {
          status: response.status,
          statusText: response.statusText,
          path
        });
        throw new BirdeyeError(
          `API request failed: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new BirdeyeError('API request returned unsuccessful response');
      }

      // Cache the successful response
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Birdeye API request error:', error);
      throw error;
    }
  }

  static async getPriceHistory(
    tokenAddress: string,
    timeFrom: number,
    timeTo: number,
    type: '5m' | '15m' | '1h' | '4h' | '1d' = '1h'
  ): Promise<PriceHistoryResponse> {
    return this.makeRequest<PriceHistoryResponse>('/defi/history_price', {
      address: tokenAddress,
      address_type: 'token',
      type,
      time_from: timeFrom,
      time_to: timeTo
    });
  }

  static async getTokenInfo(tokenAddress: string): Promise<TokenDetailsResponse> {
    return this.makeRequest<TokenDetailsResponse>('/defi/token_overview', {
      address: tokenAddress
    });
  }

  static async getTopTokens(limit: number = 50, offset: number = 0): Promise<TokenListResponse> {
    return this.makeRequest<TokenListResponse>('/defi/tokens', {
      offset,
      limit,
      sort_by: 'volume',
      sort_type: 'desc'
    });
  }

  static async searchTokens(query: string, limit: number = 10): Promise<TokenListResponse> {
    return this.makeRequest<TokenListResponse>('/token/search', {
      query,
      limit
    });
  }
}
