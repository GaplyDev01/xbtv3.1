const QUICKNODE_BASE_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  volume24h: number;
  priceChange24h: number;
  marketCap: number;
  logoURI?: string;
  supply?: {
    total: number;
    circulating: number;
  };
}

interface PriceHistory {
  timestamp: number;
  price: number;
  volume: number;
}

class QuickNodeError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'QuickNodeError';
  }
}

interface RPCResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class QuickNodeService {
  private static readonly MAX_RETRIES = 3;
  private static readonly INITIAL_BACKOFF = 1000; // 1 second
  private static rateLimitCounter = 0;
  private static readonly RATE_LIMIT = 10; // requests per second
  private static readonly RATE_WINDOW = 1000; // 1 second window

  private static async makeRequest<T>(method: string, params: any[]): Promise<T> {
    if (!QUICKNODE_BASE_URL) {
      console.warn('QuickNode RPC URL not configured, skipping QuickNode service');
      return [] as unknown as T;
    }

    // Check rate limit
    if (this.rateLimitCounter >= this.RATE_LIMIT) {
      throw new QuickNodeError('Rate limit exceeded', 429);
    }
    this.rateLimitCounter++;
    setTimeout(() => this.rateLimitCounter--, this.RATE_WINDOW);

    const cacheKey = JSON.stringify({ method, params });
    const cachedData = cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
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
          throw new QuickNodeError(
            `HTTP error: ${response.statusText}`,
            response.status
          );
        }

        const data: RPCResponse<T> = await response.json();
        
        if (data.error) {
          throw new QuickNodeError(
            `RPC error: ${data.error.message}`,
            data.error.code,
            String(data.error.code),
            data.error.data
          );
        }

        // Cache successful response
        cache.set(cacheKey, {
          data: data.result as T,
          timestamp: Date.now(),
        });

        return data.result as T;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain error types
        if (error instanceof QuickNodeError) {
          if (error.status === 401 || error.status === 403) {
            throw error; // Don't retry auth errors
          }
        }

        // Exponential backoff
        const backoff = this.INITIAL_BACKOFF * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }

    console.error('QuickNode API request failed after retries:', lastError);
    throw lastError;
  }

  static async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    const result = await this.makeRequest<any>('qn_getTokenMetadata', [tokenAddress]);
    
    return {
      address: tokenAddress,
      symbol: result.symbol,
      name: result.name,
      decimals: result.decimals,
      price: result.price?.value || 0,
      volume24h: result.volume24h || 0,
      priceChange24h: result.priceChange24h || 0,
      marketCap: result.marketCap || 0,
      supply: {
        total: result.totalSupply || 0,
        circulating: result.circulatingSupply || 0,
      },
    };
  }

  static async getTokenPriceHistory(
    tokenAddress: string,
    startTime: number,
    endTime: number
  ): Promise<PriceHistory[]> {
    const result = await this.makeRequest<any>('qn_getTokenPriceHistory', [
      tokenAddress,
      {
        startTime,
        endTime,
      },
    ]);

    return result.prices.map((item: any) => ({
      timestamp: item.timestamp,
      price: item.price,
      volume: item.volume || 0,
    }));
  }

  static async searchTokens(query: string): Promise<TokenInfo[]> {
    const result = await this.makeRequest<any>('qn_searchTokens', [query]);
    
    return result.tokens.map((token: any) => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      price: token.price?.value || 0,
      volume24h: token.volume24h || 0,
      priceChange24h: token.priceChange24h || 0,
      marketCap: token.marketCap || 0,
      supply: {
        total: token.totalSupply || 0,
        circulating: token.circulatingSupply || 0,
      },
    }));
  }
}
