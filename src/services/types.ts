export interface GlobalMarketData {
  active_cryptocurrencies: number;
  markets: number;
  total_market_cap: { [key: string]: number };
  total_volume: { [key: string]: number };
  market_cap_percentage: { [key: string]: number };
  market_cap_change_percentage_24h_usd: number;
}

export interface NFTCollectionData {
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
  number_of_unique_addresses: number;
  number_of_unique_tokens: number;
}

export interface NFTMarketData {
  floor_price_in_native_currency: number[];
  floor_price_in_usd: number[];
  h24_volume_in_native_currency: number[];
  h24_volume_in_usd: number[];
  market_cap_in_native_currency: number[];
  market_cap_in_usd: number[];
  timestamps: number[];
}

export interface DerivativesExchangeData {
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
}

export interface DerivativesTicker {
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

export interface ExchangeVolumePoint {
  timestamp: number;  // Unix timestamp in milliseconds
  volumeBTC: number;  // Volume in BTC
  volumeUSD?: number; // Volume in USD (if conversion requested)
}

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  volume_24h: number;
  liquidity_usd: number;
  sparkline_7d: number[];
  imageUrl: string;
  last_updated_at: number;
  source: 'coingecko' | 'quicknode' | 'birdeye';
  verified: boolean;
  info: {
    imageUrl: string;
    source: 'coingecko' | 'quicknode' | 'birdeye';
    verified: boolean;
  };
}

export interface TokenChartData {
  prices: [number, number][];       // [timestamp in ms, price]
  market_caps: [number, number][];  // [timestamp in ms, market cap]
  total_volumes: [number, number][]; // [timestamp in ms, 24h volume]
}

export interface TokenMarketData {
  prices: [number, number][];       // [timestamp, price]
  market_caps: [number, number][];  // [timestamp, market cap]
  total_volumes: [number, number][]; // [timestamp, volume]
}

export interface TokenOHLC {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TrendingToken {
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
  };
}

export interface TrendingResult {
  coins: {
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
    };
  }[];
  nfts: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    nft_contract_id: number;
  }[];
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  thumb?: string;
  score?: number;
}

export interface TokenDetails {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
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
  last_updated_at: number;
}

export interface PriceHistoryItem {
  timestamp: number;
  price: number;
  volume?: number;
}
