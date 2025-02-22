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
  last_updated_at?: number;
}

interface TokenPriceResponse {
  [key: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  };
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

interface GlobalMarketData {
  active_cryptocurrencies: number;
  markets: number;
  total_market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h_usd: number;
}

interface DerivativesTicker {
  symbol: string;
  base: string;
  target: string;
  trade_url: string;
  contract_type: string;
  price: number;
  index: number;
  basis: number;
  spread: number;
  funding_rate: number;
  open_interest: number;
  volume_24h: number;
  last_traded: number;
  expired_at: number | null;
}

export class CoinGeckoService {
  private static readonly BASE_URL = '/api/coingecko';

  /**
   * Fetches token price and optional market data using the simple/token_price endpoint
   * @param platform Platform ID (e.g., 'solana')
   * @param contractAddresses Array of contract addresses
   * @param options Optional parameters for additional data
   */
  static async getTokenPrices(
    platform: string,
    contractAddresses: string[],
    options: {
      includeMarketCap?: boolean;
      include24hVol?: boolean;
      include24hChange?: boolean;
      includeLastUpdated?: boolean;
      precision?: number;
    } = {}
  ): Promise<TokenPriceResponse> {
    return this.makeRequest<TokenPriceResponse>(`/simple/token_price/${platform}`, {
      'contract_addresses': contractAddresses.join(','),
      'vs_currencies': 'usd',
      'include_market_cap': options.includeMarketCap?.toString() || 'false',
      'include_24hr_vol': options.include24hVol?.toString() || 'false',
      'include_24hr_change': options.include24hChange?.toString() || 'false',
      'include_last_updated_at': options.includeLastUpdated?.toString() || 'false',
      'precision': (options.precision || 6).toString()
    });
  }
  private static readonly BASE_URL = '/api/coingecko';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static readonly SOLANA_PLATFORM_ID = 'solana';
  private static cache = new Map<string, { data: any; timestamp: number }>();

  private static async makeRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams({
      ...params,
      endpoint: endpoint // Add endpoint parameter for proxy route
    });
    
    const url = `${this.BASE_URL}?${queryParams}`;
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

  /**
   * Get trending coins and NFTs in the last 24 hours
   * @returns List of trending items with price and market data
   */
  public static async getTrending(): Promise<{
    coins: Array<{
      item: {
        id: string;
        coin_id: number;
        name: string;
        symbol: string;
        market_cap_rank: number;
        thumb: string;
        small: string;
        large: string;
        slug: string;
        price_btc: number;
        score: number;
      }
    }>;
    nfts: Array<{
      id: string;
      name: string;
      symbol: string;
      thumb: string;
      nft_contract_id: number;
    }>
  }> {
    try {
      const endpoint = '/search/trending';
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching trending data:', error);
      return { coins: [], nfts: [] };
    }
  }

  /**
   * Get historical volume data for an exchange
   * @param exchangeId Exchange ID from /exchanges/list
   * @param days Number of days to get data for (1/7/14/30/90/180/365)
   * @returns Array of [timestamp, volume] pairs
   */
  public static async getExchangeVolumeChart(
    exchangeId: string,
    days: number | string
  ): Promise<[number, number][]> {
    try {
      const endpoint = `/exchanges/${exchangeId}/volume_chart`;
      const params = { days: typeof days === 'number' ? days.toString() : days };
      
      const response = await this.makeRequest<[number, number][]>(endpoint, params);
      return response;
    } catch (error) {
      console.error('Error fetching exchange volume data:', error);
      return [];
    }
  }

  /**
   * Get current exchange rates for all supported currencies
   * @returns Object with rates where BTC is the base currency
   */
  public static async getExchangeRates(): Promise<{ 
    rates: { 
      [key: string]: { 
        name: string;
        unit: string;
        value: number;
        type: 'crypto' | 'fiat';
      }
    } 
  }> {
    try {
      const endpoint = '/exchange_rates';
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return { rates: {} };
    }
  }

  /**
   * Get global cryptocurrency market data
   * @returns Global market statistics including total market cap, volume, and market changes
   */
  public static async getGlobalData(): Promise<GlobalMarketData> {
    try {
      const endpoint = '/global';
      const response = await this.makeRequest<{
        data: {
          active_cryptocurrencies: number;
          markets: number;
          total_market_cap: { [key: string]: number };
          total_volume: { [key: string]: number };
          market_cap_percentage: { [key: string]: number };
          market_cap_change_percentage_24h_usd: number;
          updated_at: number;
        }
      }>(endpoint);

      // Transform response to match GlobalMarketData interface
      return {
        active_cryptocurrencies: response.data.active_cryptocurrencies,
        markets: response.data.markets,
        total_market_cap: response.data.total_market_cap,
        total_volume: response.data.total_volume,
        market_cap_percentage: response.data.market_cap_percentage,
        market_cap_change_percentage_24h_usd: response.data.market_cap_change_percentage_24h_usd
      };
    } catch (error) {
      console.error('Error fetching global market data:', error);
      return {
        active_cryptocurrencies: 0,
        markets: 0,
        total_market_cap: {},
        total_volume: {},
        market_cap_percentage: {},
        market_cap_change_percentage_24h_usd: 0
      };
    }
  }

  /**
   * Get NFT collection data by ID
   * @param nftId The NFT collection ID from CoinGecko
   * @returns Detailed NFT collection data including price and market statistics
   */
  public static async getNFTData(nftId: string): Promise<{
    id: string;
    contract_address: string;
    name: string;
    asset_platform_id: string;
    symbol: string;
    image: {
      small: string;
      thumb: string;
    };
    description: string;
    native_currency: string;
    floor_price: {
      native_currency: number;
      usd: number;
    };
    market_cap: {
      native_currency: number;
      usd: number;
    };
    volume_24h: {
      native_currency: number;
      usd: number;
    };
    floor_price_24h_percentage_change: number;
    market_cap_24h_percentage_change: number;
    volume_24h_percentage_change: number;
    number_of_unique_addresses: number;
    number_of_unique_addresses_24h_percentage_change: number;
    total_supply: number;
    number_of_unique_tokens: number;
    links: {
      homepage: string;
      twitter: string;
      discord: string;
      telegram: string;
    };
  }> {
    try {
      const endpoint = `/nfts/${nftId}`;
      const response = await this.makeRequest(endpoint);
      
      // Ensure number_of_unique_tokens is included, fallback to total_supply if not available
      return {
        ...response,
        number_of_unique_tokens: response.number_of_unique_tokens ?? response.total_supply ?? 0
      };
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      throw new Error(`Failed to fetch NFT data for ID: ${nftId}`);
    }
  }

  /**
   * Get NFT collection data by contract address
   * @param assetPlatformId The platform ID (e.g., 'ethereum', 'solana')
   * @param contractAddress The NFT contract address
   * @returns Detailed NFT collection data
   */
  public static async getNFTByContract(
    assetPlatformId: string,
    contractAddress: string
  ): Promise<{
    id: string;
    contract_address: string;
    name: string;
    asset_platform_id: string;
    symbol: string;
    image: {
      small: string;
      thumb: string;
    };
    description: string;
    native_currency: string;
    floor_price: {
      native_currency: number;
      usd: number;
    };
    market_cap: {
      native_currency: number;
      usd: number;
    };
    volume_24h: {
      native_currency: number;
      usd: number;
    };
    floor_price_24h_percentage_change: number;
    market_cap_24h_percentage_change: number;
    volume_24h_percentage_change: number;
    number_of_unique_addresses: number;
    number_of_unique_addresses_24h_percentage_change: number;
    total_supply: number;
    number_of_unique_tokens: number;
    links: {
      homepage: string;
      twitter: string;
      discord: string;
      telegram: string;
    };
  }> {
    try {
      const endpoint = `/nfts/${assetPlatformId}/contract/${contractAddress}`;
      const response = await this.makeRequest(endpoint);
      
      // Ensure number_of_unique_tokens is included, fallback to total_supply if not available
      return {
        ...response,
        number_of_unique_tokens: response.number_of_unique_tokens ?? response.total_supply ?? 0
      };
    } catch (error) {
      console.error('Error fetching NFT data by contract:', error);
      throw new Error(`Failed to fetch NFT data for contract: ${contractAddress} on platform: ${assetPlatformId}`);
    }
  }

  /**
   * Get all derivatives tickers
   * @returns Array of derivatives tickers with market data
   */
  public static async getDerivativesTickers(): Promise<Array<DerivativesTicker>> {
    try {
      const endpoint = '/derivatives/tickers';
      const response = await this.makeRequest<{
        tickers: Array<{
          symbol: string;
          base: string;
          target: string;
          trade_url: string;
          contract_type: string;
          price: string;
          index: number;
          price_percentage_change_24h: number;
          contract_price: string;
          index_basis_percentage: number;
          funding_rate: number;
          open_interest: number;
          volume_24h: number;
          last_traded: number;
          expired_at: number | null;
        }>
      }>(endpoint);

      // Transform response to match DerivativesTicker interface
      return response.tickers.map(ticker => {
        const price = parseFloat(ticker.price);
        const contractPrice = parseFloat(ticker.contract_price);
        
        return {
          symbol: ticker.symbol,
          base: ticker.base,
          target: ticker.target,
          trade_url: ticker.trade_url,
          contract_type: ticker.contract_type,
          price,
          index: ticker.index,
          // Calculate basis as the difference between contract price and index
          basis: contractPrice - ticker.index,
          // Calculate spread as the percentage difference between highest and lowest price
          spread: ((Math.max(price, contractPrice) - Math.min(price, contractPrice)) / Math.min(price, contractPrice)) * 100,
          funding_rate: ticker.funding_rate,
          open_interest: ticker.open_interest,
          volume_24h: ticker.volume_24h,
          last_traded: ticker.last_traded,
          expired_at: ticker.expired_at
        };
      });
    } catch (error) {
      console.error('Error fetching derivatives tickers:', error);
      return [];
    }
  }

  /**
   * Get detailed data for a specific derivatives exchange
   * @param exchangeId The derivatives exchange ID from /derivatives/exchanges/list
   * @returns Detailed exchange data including trading pairs and market metrics
   */
  public static async getDerivativesExchange(exchangeId: string): Promise<{
    name: string;
    id: string;
    open_interest_btc: number;
    trade_volume_24h_btc: number;
    number_of_perpetual_pairs: number;
    number_of_futures_pairs: number;
    image: string;
    year_established: number;
    country: string;
    description: string;
    url: string;
    tickers: Array<{
      symbol: string;
      base: string;
      target: string;
      trade_url: string;
      contract_type: string;
      price: string;
      index: number;
      basis: number;
      spread: number;
      funding_rate: number;
      open_interest: number;
      volume_24h: number;
      last_traded: number;
      expired_at: number | null;
    }>;
  }> {
    try {
      const endpoint = `/derivatives/exchanges/${exchangeId}`;
      return await this.makeRequest(endpoint);
    } catch (error) {
      console.error('Error fetching derivatives exchange data:', error);
      throw new Error(`Failed to fetch derivatives exchange data for ID: ${exchangeId}`);
    }
  }

  /**
   * Get historical market data for a token
   * @param coinId Token ID from CoinGecko
   * @param days Number of days of data to fetch (1/7/14/30/90/180/365/max)
   * @param options Additional options like vs_currency and interval
   */
  static async getTokenMarketChart(
    coinId: string,
    days: number | 'max',
    options: {
      vs_currency?: string;
      interval?: '5m' | 'hourly' | 'daily';
    } = {}
  ): Promise<{
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  }> {
    const params: Record<string, string> = {
      vs_currency: options.vs_currency || 'usd',
      days: days.toString()
    };

    if (options.interval) {
      params.interval = options.interval;
    }

    return this.makeRequest(`/coins/${coinId}/market_chart`, params);
  }

  /**
   * Get historical market data for an NFT collection
   * @param nftId The NFT collection ID from CoinGecko
   * @param days Number of days of data to fetch (1/7/14/30/90/180/365/max)
   * @returns Historical market data including floor prices, volumes, and market caps
   */
  public static async getNFTMarketChart(
    nftId: string,
    days: number
  ): Promise<{
    floor_price_in_native_currency: number[];
    floor_price_in_usd: number[];
    h24_volume_in_native_currency: number[];
    h24_volume_in_usd: number[];
    market_cap_in_native_currency: number[];
    market_cap_in_usd: number[];
    timestamps: number[];
  }> {
    try {
      const endpoint = `/nfts/${nftId}/market_chart`;
      const params = { days: days.toString() };
      
      const response = await this.makeRequest<{
        floor_price_native: [number, number][];
        floor_price_usd: [number, number][];
        volume_24h_native: [number, number][];
        volume_24h_usd: [number, number][];
        market_cap_native: [number, number][];
        market_cap_usd: [number, number][];
      }>(endpoint, params);

      // Transform the response to match the expected format
      const timestamps = response.floor_price_native.map(([timestamp]) => timestamp);
      
      return {
        floor_price_in_native_currency: response.floor_price_native.map(([, value]) => value),
        floor_price_in_usd: response.floor_price_usd.map(([, value]) => value),
        h24_volume_in_native_currency: response.volume_24h_native.map(([, value]) => value),
        h24_volume_in_usd: response.volume_24h_usd.map(([, value]) => value),
        market_cap_in_native_currency: response.market_cap_native.map(([, value]) => value),
        market_cap_in_usd: response.market_cap_usd.map(([, value]) => value),
        timestamps
      };
    } catch (error) {
      console.error('Error fetching NFT market chart:', error);
      return {
        floor_price_in_native_currency: [],
        floor_price_in_usd: [],
        h24_volume_in_native_currency: [],
        h24_volume_in_usd: [],
        market_cap_in_native_currency: [],
        market_cap_in_usd: [],
        timestamps: []
      };
    }
  }
}
