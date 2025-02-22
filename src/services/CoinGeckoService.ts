import { COINGECKO_API_KEY } from '@/config/env';

interface CoinGeckoTokenInfo {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
}

interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MarketDataOptions {
  category?: string;
  order?: 'market_cap_asc' | 'market_cap_desc' | 'volume_asc' | 'volume_desc' | 'id_asc' | 'id_desc';
  perPage?: number;
  page?: number;
  sparkline?: boolean;
  priceChangePercentage?: Array<'1h' | '24h' | '7d' | '14d' | '30d' | '200d' | '1y'>;
  precision?: number;
  ids?: string;
}

interface MarketData extends CoinGeckoTokenInfo {
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_14d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  price_change_percentage_200d_in_currency?: number;
  price_change_percentage_1y_in_currency?: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export class CoinGeckoService {
  private static readonly BASE_URL = 'https://pro-api.coingecko.com/api/v3';
  private static readonly FREE_BASE_URL = 'https://api.coingecko.com/api/v3';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly SOLANA_PLATFORM_ID = 'solana';
  private static cache = new Map<string, { data: any; timestamp: number }>();

  private static async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams(params);
    
    // Use pro API if key is available, otherwise use free API
    const baseUrl = COINGECKO_API_KEY ? this.BASE_URL : this.FREE_BASE_URL;
    let url = `${baseUrl}${endpoint}?${queryParams}`;
    
    if (COINGECKO_API_KEY) {
      url += `&x_cg_pro_api_key=${COINGECKO_API_KEY}`;
    }
    const cacheKey = url;

    // Check cache
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < this.CACHE_DURATION) {
      return cachedData.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('CoinGecko API request failed:', error);
      throw error;
    }
  }

  static async getTokenInfo(tokenId: string): Promise<CoinGeckoTokenInfo> {
    return this.makeRequest<CoinGeckoTokenInfo>(`/coins/${tokenId}`, {
      localization: 'false',
      tickers: 'false',
      community_data: 'false',
      developer_data: 'false'
    });
  }

  static async getOHLCData(tokenId: string, days: number = 7): Promise<OHLCData[]> {
    const data = await this.makeRequest<[number, number, number, number, number][]>(
      `/coins/${tokenId}/ohlc`,
      { vs_currency: 'usd', days: days.toString() }
    );

    return data.map(([timestamp, open, high, low, close]) => ({
      timestamp,
      open,
      high,
      low,
      close
    }));
  }

  static async searchTokens(query: string): Promise<CoinGeckoTokenInfo[]> {
    return this.makeRequest<CoinGeckoTokenInfo[]>('/search', {
      query,
      platform: 'solana'
    });
  }

  static async getMarketData(
    options: MarketDataOptions = {}
  ): Promise<MarketData[]> {
    const params: Record<string, string> = {
      vs_currency: 'usd',
      platform: this.SOLANA_PLATFORM_ID
    };

    if (options.category) {
      params.category = options.category;
    }
    if (options.order) {
      params.order = options.order;
    }
    if (options.perPage) {
      params.per_page = options.perPage.toString();
    }
    if (options.page) {
      params.page = options.page.toString();
    }
    if (options.sparkline !== undefined) {
      params.sparkline = options.sparkline.toString();
    }
    if (options.priceChangePercentage?.length) {
      params.price_change_percentage = options.priceChangePercentage.join(',');
    }
    if (typeof options.precision === 'number') {
      params.precision = options.precision.toString();
    }

    return this.makeRequest<MarketData[]>(
      '/coins/markets',
      params
    );
  }

  static async getTokenMarketData(
    tokenIds: string[],
    options: Omit<MarketDataOptions, 'category'> = {}
  ): Promise<MarketData[]> {
    return this.getMarketData({
      ...options,
      ids: tokenIds.join(',')
    });
  }

  static async getTopTokens(
    limit: number = 50,
    options: Omit<MarketDataOptions, 'perPage' | 'page'> = {}
  ): Promise<MarketData[]> {
    return this.getMarketData({
      ...options,
      perPage: limit,
      page: 1
    });
  }

  static async getTrendingTokens(): Promise<MarketData[]> {
    const trending = await this.makeRequest<{ coins: Array<{ item: { id: string } }> }>(
      '/search/trending'
    );
    
    const trendingIds = trending.coins.map(coin => coin.item.id);
    return this.getTokenMarketData(trendingIds);
  }
}
