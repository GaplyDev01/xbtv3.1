"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTradingSignals = exports.TradingSignalSchema = exports.TechnicalIndicatorSchema = void 0;
const zod_1 = require("zod");
const DexScreenerService_1 = require("./DexScreenerService");
exports.TechnicalIndicatorSchema = zod_1.z.object({
    rsi: zod_1.z.number(),
    macd: zod_1.z.object({
        value: zod_1.z.number(),
        signal: zod_1.z.number(),
        histogram: zod_1.z.number(),
    }),
    ema20: zod_1.z.number(),
    sma50: zod_1.z.number(),
    sma200: zod_1.z.number(),
    bollingerBands: zod_1.z.object({
        upper: zod_1.z.number(),
        middle: zod_1.z.number(),
        lower: zod_1.z.number(),
    }),
    volume24h: zod_1.z.number(),
    priceChange24h: zod_1.z.number(),
    volatility: zod_1.z.number(),
});
exports.TradingSignalSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    sentiment: zod_1.z.enum(['bullish', 'bearish', 'neutral']),
    confidence: zod_1.z.number(),
    targetPrice: zod_1.z.number(),
    currentPrice: zod_1.z.number(),
    timeframe: zod_1.z.string(),
    indicators: exports.TechnicalIndicatorSchema,
    analysis: zod_1.z.array(zod_1.z.string()),
});
const calculateRSI = (prices) => {
    if (prices.length < 14)
        return 50;
    const changes = prices.slice(1).map((price, i) => price - prices[i]);
    const gains = changes.filter((c) => c > 0);
    const losses = changes.filter((c) => c < 0).map((l) => Math.abs(l));
    const avgGain = gains.reduce((a, b) => a + b, 0) / 14;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / 14;
    const rs = avgGain / (avgLoss || 1);
    return 100 - (100 / (1 + rs));
};
const calculateMACD = (prices) => {
    if (prices.length < 26) {
        return { value: 0, signal: 0, histogram: 0 };
    }
    const ema12 = prices.slice(-12).reduce((a, b) => a + b) / 12;
    const ema26 = prices.slice(-26).reduce((a, b) => a + b) / 26;
    const macdValue = ema12 - ema26;
    const signal = prices.slice(-9).reduce((a, b) => a + b) / 9;
    return {
        value: macdValue,
        signal,
        histogram: macdValue - signal,
    };
};
const calculateBollingerBands = (prices) => {
    const sma = prices.reduce((a, b) => a + b, 0) / prices.length;
    const standardDeviation = Math.sqrt(prices.reduce((sq, n) => sq + Math.pow(n - sma, 2), 0) / prices.length);
    return {
        upper: sma + standardDeviation * 2,
        middle: sma,
        lower: sma - standardDeviation * 2,
    };
};
const generateTradingSignals = async (preferences) => {
    var _a, _b, _c;
    const signals = [];
    for (const symbol of preferences.symbols) {
        try {
            // Search for the token pair
            const searchResults = await DexScreenerService_1.DexScreenerService.searchPairs(symbol);
            if (!searchResults.pairs.length)
                continue;
            // Get the best pair by liquidity
            const bestPair = searchResults.pairs.reduce((best, current) => { var _a, _b; return (((_a = current.liquidity) === null || _a === void 0 ? void 0 : _a.usd) || 0) > (((_b = best.liquidity) === null || _b === void 0 ? void 0 : _b.usd) || 0) ? current : best; });
            // Get token info for more details
            const tokenInfo = await DexScreenerService_1.DexScreenerService.getTokenInfo('solana', bestPair.baseToken.address);
            // Get price history
            const priceHistory = await DexScreenerService_1.DexScreenerService.getPairPriceHistory('solana', bestPair.pairAddress, preferences.timeframe);
            if (!((_a = priceHistory === null || priceHistory === void 0 ? void 0 : priceHistory.candles) === null || _a === void 0 ? void 0 : _a.length))
                continue;
            const prices = priceHistory.candles.map((candle) => candle.close);
            const currentPrice = Number(bestPair.priceUsd || prices[prices.length - 1]);
            // Calculate technical indicators
            const rsi = calculateRSI(prices);
            const macd = calculateMACD(prices);
            const bollingerBands = calculateBollingerBands(prices);
            const ema20 = prices.slice(-20).reduce((a, b) => a + b) / 20;
            const sma50 = prices.slice(-50).reduce((a, b) => a + b) / 50;
            const sma200 = prices.length >= 200
                ? prices.slice(-200).reduce((a, b) => a + b) / 200
                : prices.reduce((a, b) => a + b) / prices.length;
            // Generate AI analysis
            const analysis = [];
            if (rsi > 70) {
                analysis.push('Overbought conditions detected');
            }
            else if (rsi < 30) {
                analysis.push('Oversold conditions detected');
            }
            if (macd.histogram > 0 && macd.histogram > macd.signal) {
                analysis.push('MACD showing bullish momentum');
            }
            else if (macd.histogram < 0 && macd.histogram < macd.signal) {
                analysis.push('MACD indicating bearish pressure');
            }
            if (currentPrice > bollingerBands.upper) {
                analysis.push('Price above upper Bollinger Band - potential reversal');
            }
            else if (currentPrice < bollingerBands.lower) {
                analysis.push('Price below lower Bollinger Band - watch for bounce');
            }
            // Determine overall sentiment
            let sentiment = 'neutral';
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
            }
            else if (bearishSignals > bullishSignals) {
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
                        volume24h: ((_b = bestPair.volume) === null || _b === void 0 ? void 0 : _b.h24) || 0,
                        priceChange24h: ((_c = bestPair.priceChange) === null || _c === void 0 ? void 0 : _c.h24) || 0,
                        volatility: Math.sqrt(prices.slice(-20)
                            .map((p, i, arr) => i === 0 ? 0 : Math.pow(Math.log(p / arr[i - 1]), 2))
                            .reduce((a, b) => a + b) / 20) * Math.sqrt(365) * 100,
                    },
                    analysis,
                });
            }
        }
        catch (error) {
            console.error(`Error generating signal for ${symbol}:`, error);
        }
    }
    return signals;
};
exports.generateTradingSignals = generateTradingSignals;
//# sourceMappingURL=tradingSignals.js.map