export interface TokenPrice {
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  last_updated_at: number;
}

export interface TokenMarketData {
  prices: [number, number][];  // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface TokenOHLC {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
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
