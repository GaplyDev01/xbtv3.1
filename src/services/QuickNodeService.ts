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
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'QuickNodeError';
  }
}

export class QuickNodeService {
  private static async makeRequest<T>(method: string, params: any[]): Promise<T> {
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
    } catch (error) {
      console.error('QuickNode API request error:', error);
      throw error;
    }
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
