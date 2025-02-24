import { TokenServiceError } from './TokenService';

const BITQUERY_API_KEY = 'ory_at_N7NHaOOi_WSu9_ZoItT13dmvv5El1pCKGtMLUu6tPLM.L52yJbeyXjKVeKq65WcFSFgQhbzTHSBEXlPyh06bs_w';
const BITQUERY_ENDPOINT = 'https://streaming.bitquery.io/eap';

interface BitqueryToken {
  mintAddress: string;
  name: string;
  symbol: string;
  price: number;
  priceUSD: number;
}

interface BitqueryTokenPrice {
  price: number;
  volume24h: number;
  marketCap: number;
  timestamp: string;
}

export class BitqueryService {
  private static async query(queryStr: string) {
    try {
      const response = await fetch(BITQUERY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BITQUERY_API_KEY}`,
        },
        body: JSON.stringify({
        query: queryStr,
        variables: '{}'
      }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data;
    } catch (error) {
      console.error('Bitquery API error:', error);
      throw new TokenServiceError(
        'Failed to fetch data from Bitquery',
        'BITQUERY_API_ERROR'
      );
    }
  }

  static async searchTokens(query: string) {
    const searchQuery = `
      query {
        Solana {
          DEXTrades(
            orderBy: {descending: Block_Time}
            limit: {count: 100}
            limitBy: {by: Trade_Buy_Currency_MintAddress, count: 1}
            where: {Trade: {Buy: {Currency: {Name: {includesCaseInsensitive: "${query}"}}}}}
          ) {
            Trade {
              Buy {
                Price
                PriceInUSD
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
              }
              Sell {
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.query(searchQuery);
    const trades = data?.Solana?.DEXTrades || [];
    
    // Create a map to deduplicate tokens and keep the latest price
    const tokenMap = new Map<string, BitqueryToken>();
    
    trades.forEach(trade => {
      const buyToken = trade.Trade.Buy.Currency;
      tokenMap.set(buyToken.MintAddress, {
        mintAddress: buyToken.MintAddress,
        name: buyToken.Name,
        symbol: buyToken.Symbol,
        price: trade.Trade.Buy.Price,
        priceUSD: trade.Trade.Buy.PriceInUSD
      });
    });
    
    return Array.from(tokenMap.values());
  }

  static async getTokenPrice(address: string) {
    const priceQuery = `
      query {
        Solana {
          DEXTrades(
            orderBy: {descending: Block_Time}
            limit: {count: 1}
            where: {Trade: {Buy: {Currency: {MintAddress: {is: "${address}"}}}}}
          ) {
            Trade {
              Buy {
                Price
                PriceInUSD
                Currency {
                  Name
                  Symbol
                  MintAddress
                }
              }
              Block {
                Time
              }
              Volume: Amount
              VolumeInUSD: AmountInUSD
            }
          }
        }
      }
    `;

    const data = await this.query(priceQuery);
    const trade = data?.Solana?.DEXTrades?.[0]?.Trade;
    
    if (!trade) {
      throw new TokenServiceError(
        'Token not found',
        'TOKEN_NOT_FOUND'
      );
    }

    return {
      name: trade.Buy.Currency.Name,
      symbol: trade.Buy.Currency.Symbol,
      price: trade.Buy.Price,
      priceUSD: trade.Buy.PriceInUSD,
      volume24h: trade.VolumeInUSD,
      marketCap: trade.VolumeInUSD * trade.Buy.Price, // Approximate market cap
      timestamp: trade.Block.Time
    };
  }

  static async getTokenPriceHistory(address: string, days: number) {
    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (days * 24 * 60 * 60);

    const historyQuery = `
      query {
        solana {
          trades(
            where: {
              token: {address: {is: "${address}"}},
              time: {
                between: ["${new Date(startTime * 1000).toISOString()}", "${new Date(endTime * 1000).toISOString()}"]
              }
            }
            orderBy: {time: asc}
          ) {
            time
            price: minimum_price
            volume: trade_amount
          }
        }
      }
    `;

    const data = await this.query(historyQuery);
    return data?.solana?.trades || [];
  }
}
