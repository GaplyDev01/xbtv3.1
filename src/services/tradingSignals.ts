import { z } from 'zod';
import { DexScreenerService } from './DexScreenerService';

export const TechnicalIndicatorSchema = z.object({
  rsi: z.number(),
  macd: z.object({
    value: z.number(),
    signal: z.number(),
    histogram: z.number(),
  }),
  ema20: z.number(),
  sma50: z.number(),
  sma200: z.number(),
  bollingerBands: z.object({
    upper: z.number(),
    middle: z.number(),
    lower: z.number(),
  }),
  volume24h: z.number(),
  priceChange24h: z.number(),
  volatility: z.number(),
});

export const TradingSignalSchema = z.object({
  symbol: z.string(),
  sentiment: z.enum(['bullish', 'bearish', 'neutral']),
  confidence: z.number(),
  targetPrice: z.number(),
  currentPrice: z.number(),
  timeframe: z.string(),
  indicators: TechnicalIndicatorSchema,
  analysis: z.array(z.string()),
});

export type TradingSignal = z.infer<typeof TradingSignalSchema>;
export type TechnicalIndicator = z.infer<typeof TechnicalIndicatorSchema>;

export interface SignalPreferences {
  timeframe: '1h' | '24h' | '7d' | '30d';
  indicators: string[];
  minConfidence: number;
  symbols: string[];
}

const calculateRSI = (prices: number[]): number => {
  if (prices.length < 14) return 50;
  const changes = prices.slice(1).map((price: number, i: number) => price - prices[i]);
  const gains = changes.filter((c: number) => c > 0);
  const losses = changes.filter((c: number) => c < 0).map((l: number) => Math.abs(l));
  
  const avgGain = gains.reduce((a: number, b: number) => a + b, 0) / 14;
  const avgLoss = losses.reduce((a: number, b: number) => a + b, 0) / 14;
  
  const rs = avgGain / (avgLoss || 1);
  return 100 - (100 / (1 + rs));
};

const calculateMACD = (prices: number[]): TradingSignal['indicators']['macd'] => {
  if (prices.length < 26) {
    return { value: 0, signal: 0, histogram: 0 };
  }

  const ema12 = prices.slice(-12).reduce((a: number, b: number) => a + b) / 12;
  const ema26 = prices.slice(-26).reduce((a: number, b: number) => a + b) / 26;
  const macdValue = ema12 - ema26;
  const signal = prices.slice(-9).reduce((a: number, b: number) => a + b) / 9;
  
  return {
    value: macdValue,
    signal,
    histogram: macdValue - signal,
  };
};

const calculateBollingerBands = (prices: number[]) => {
  const sma = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
  const standardDeviation = Math.sqrt(
    prices.reduce((sq: number, n: number) => sq + Math.pow(n - sma, 2), 0) / prices.length
  );
  
  return {
    upper: sma + standardDeviation * 2,
    middle: sma,
    lower: sma - standardDeviation * 2,
  };
};

export const generateTradingSignals = async (
  preferences: SignalPreferences
): Promise<TradingSignal[]> => {
  const signals: TradingSignal[] = [];

  for (const symbol of preferences.symbols) {
    try {
      // Search for the token pair
      const searchResults = await DexScreenerService.searchPairs(symbol);
      if (!searchResults.pairs.length) continue;

      // Get the best pair by liquidity
      const bestPair = searchResults.pairs.reduce((best, current) => 
        (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best
      );

      // Get token info for more details
      const tokenInfo = await DexScreenerService.getTokenInfo('solana', bestPair.baseToken.address);
      // Get price history
      const priceHistory = await DexScreenerService.getPairPriceHistory('solana', bestPair.pairAddress, preferences.timeframe);
      
      if (!priceHistory?.candles?.length) continue;

      const prices = priceHistory.candles.map((candle: { close: number }) => candle.close);
      const currentPrice = Number(bestPair.priceUsd || prices[prices.length - 1]);
      
      // Calculate technical indicators
      const rsi = calculateRSI(prices);
      const macd = calculateMACD(prices);
      const bollingerBands = calculateBollingerBands(prices);
      const ema20 = prices.slice(-20).reduce((a: number, b: number) => a + b) / 20;
      const sma50 = prices.slice(-50).reduce((a: number, b: number) => a + b) / 50;
      const sma200 = prices.length >= 200 
        ? prices.slice(-200).reduce((a: number, b: number) => a + b) / 200 
        : prices.reduce((a: number, b: number) => a + b) / prices.length;

      // Generate AI analysis
      const analysis: string[] = [];
      
      if (rsi > 70) {
        analysis.push('Overbought conditions detected');
      } else if (rsi < 30) {
        analysis.push('Oversold conditions detected');
      }

      if (macd.histogram > 0 && macd.histogram > macd.signal) {
        analysis.push('MACD showing bullish momentum');
      } else if (macd.histogram < 0 && macd.histogram < macd.signal) {
        analysis.push('MACD indicating bearish pressure');
      }

      if (currentPrice > bollingerBands.upper) {
        analysis.push('Price above upper Bollinger Band - potential reversal');
      } else if (currentPrice < bollingerBands.lower) {
        analysis.push('Price below lower Bollinger Band - watch for bounce');
      }

      // Determine overall sentiment
      let sentiment: TradingSignal['sentiment'] = 'neutral';
      let confidence = 50;
      
      const bullishSignals = [
        currentPrice > Number(sma50),
        currentPrice > Number(sma200),
        rsi > 50 && rsi < 70,
        macd.histogram > 0,
        currentPrice > Number(bollingerBands.middle),
      ].filter(Boolean).length;

      const bearishSignals = [
        currentPrice < Number(sma50),
        currentPrice < Number(sma200),
        rsi < 50,
        macd.histogram < 0,
        currentPrice < Number(bollingerBands.middle),
      ].filter(Boolean).length;

      if (bullishSignals > bearishSignals) {
        sentiment = 'bullish';
        confidence = Math.min(100, 50 + (bullishSignals * 10));
      } else if (bearishSignals > bullishSignals) {
        sentiment = 'bearish';
        confidence = Math.min(100, 50 + (bearishSignals * 10));
      }

      // Only include signals that meet minimum confidence threshold
      if (confidence >= preferences.minConfidence) {
        signals.push({
          symbol: symbol.toUpperCase(),
          sentiment,
          confidence,
          targetPrice: Number(currentPrice) * (1 + (sentiment === 'bullish' ? 0.1 : sentiment === 'bearish' ? -0.1 : 0)),
          currentPrice,
          timeframe: preferences.timeframe,
          indicators: {
            rsi,
            macd,
            ema20,
            sma50,
            sma200,
            bollingerBands,
            volume24h: bestPair.volume?.h24 || 0,
            priceChange24h: bestPair.priceChange?.h24 || 0,
            volatility: Math.sqrt(prices.slice(-20)
              .map((p: number, i: number, arr: number[]) => i === 0 ? 0 : Math.pow(Math.log(p / arr[i - 1]), 2))
              .reduce((a: number, b: number) => a + b) / 20) * Math.sqrt(365) * 100,
          },
          analysis,
        });
      }
    } catch (error) {
      console.error(`Error generating signal for ${symbol}:`, error);
    }
  }

  return signals;
};
