import { z } from 'zod';
export declare const TechnicalIndicatorSchema: z.ZodObject<{
    rsi: z.ZodNumber;
    macd: z.ZodObject<{
        value: z.ZodNumber;
        signal: z.ZodNumber;
        histogram: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        signal: number;
        histogram: number;
    }, {
        value: number;
        signal: number;
        histogram: number;
    }>;
    ema20: z.ZodNumber;
    sma50: z.ZodNumber;
    sma200: z.ZodNumber;
    bollingerBands: z.ZodObject<{
        upper: z.ZodNumber;
        middle: z.ZodNumber;
        lower: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        upper: number;
        middle: number;
        lower: number;
    }, {
        upper: number;
        middle: number;
        lower: number;
    }>;
    volume24h: z.ZodNumber;
    priceChange24h: z.ZodNumber;
    volatility: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    volume24h: number;
    priceChange24h: number;
    rsi: number;
    macd: {
        value: number;
        signal: number;
        histogram: number;
    };
    ema20: number;
    sma50: number;
    sma200: number;
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
    };
    volatility: number;
}, {
    volume24h: number;
    priceChange24h: number;
    rsi: number;
    macd: {
        value: number;
        signal: number;
        histogram: number;
    };
    ema20: number;
    sma50: number;
    sma200: number;
    bollingerBands: {
        upper: number;
        middle: number;
        lower: number;
    };
    volatility: number;
}>;
export declare const TradingSignalSchema: z.ZodObject<{
    symbol: z.ZodString;
    sentiment: z.ZodEnum<["bullish", "bearish", "neutral"]>;
    confidence: z.ZodNumber;
    targetPrice: z.ZodNumber;
    currentPrice: z.ZodNumber;
    timeframe: z.ZodString;
    indicators: z.ZodObject<{
        rsi: z.ZodNumber;
        macd: z.ZodObject<{
            value: z.ZodNumber;
            signal: z.ZodNumber;
            histogram: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            value: number;
            signal: number;
            histogram: number;
        }, {
            value: number;
            signal: number;
            histogram: number;
        }>;
        ema20: z.ZodNumber;
        sma50: z.ZodNumber;
        sma200: z.ZodNumber;
        bollingerBands: z.ZodObject<{
            upper: z.ZodNumber;
            middle: z.ZodNumber;
            lower: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            upper: number;
            middle: number;
            lower: number;
        }, {
            upper: number;
            middle: number;
            lower: number;
        }>;
        volume24h: z.ZodNumber;
        priceChange24h: z.ZodNumber;
        volatility: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        volume24h: number;
        priceChange24h: number;
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        ema20: number;
        sma50: number;
        sma200: number;
        bollingerBands: {
            upper: number;
            middle: number;
            lower: number;
        };
        volatility: number;
    }, {
        volume24h: number;
        priceChange24h: number;
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        ema20: number;
        sma50: number;
        sma200: number;
        bollingerBands: {
            upper: number;
            middle: number;
            lower: number;
        };
        volatility: number;
    }>;
    analysis: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
    targetPrice: number;
    currentPrice: number;
    timeframe: string;
    indicators: {
        volume24h: number;
        priceChange24h: number;
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        ema20: number;
        sma50: number;
        sma200: number;
        bollingerBands: {
            upper: number;
            middle: number;
            lower: number;
        };
        volatility: number;
    };
    analysis: string[];
}, {
    symbol: string;
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
    targetPrice: number;
    currentPrice: number;
    timeframe: string;
    indicators: {
        volume24h: number;
        priceChange24h: number;
        rsi: number;
        macd: {
            value: number;
            signal: number;
            histogram: number;
        };
        ema20: number;
        sma50: number;
        sma200: number;
        bollingerBands: {
            upper: number;
            middle: number;
            lower: number;
        };
        volatility: number;
    };
    analysis: string[];
}>;
export type TradingSignal = z.infer<typeof TradingSignalSchema>;
export type TechnicalIndicator = z.infer<typeof TechnicalIndicatorSchema>;
export interface SignalPreferences {
    timeframe: '1h' | '24h' | '7d' | '30d';
    indicators: string[];
    minConfidence: number;
    symbols: string[];
}
export declare const generateTradingSignals: (preferences: SignalPreferences) => Promise<TradingSignal[]>;
