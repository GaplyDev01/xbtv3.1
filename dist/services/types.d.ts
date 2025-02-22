export interface GlobalMarketData {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: {
        [key: string]: number;
    };
    total_volume: {
        [key: string]: number;
    };
    market_cap_percentage: {
        [key: string]: number;
    };
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
    expired_at: number;
}
export interface ExchangeVolumePoint {
    timestamp: number;
    volumeBTC: number;
    volumeUSD?: number;
}
export interface TokenPrice {
    current_price: number;
    price_change_percentage_24h: number;
    total_volume: number;
    market_cap: number;
    last_updated_at: number;
}
export interface TokenChartData {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
}
export interface TokenMarketData {
    prices: [number, number][];
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
