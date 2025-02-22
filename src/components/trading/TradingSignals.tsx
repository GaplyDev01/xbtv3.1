'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Brain, Target, BarChart2 } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { LoadingSpinner } from '../loading/LoadingSpinner';

interface TradingSignal {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  timeframe: string;
  indicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    volume24h: number;
    priceChange24h: number;
  };
  analysis: string[];
}

export function TradingSignals() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated AI analysis - In production, this would come from a real AI model
  useEffect(() => {
    const mockSignals: TradingSignal[] = [
      {
        symbol: 'BTC',
        sentiment: 'bullish',
        confidence: 85,
        targetPrice: 52000,
        currentPrice: 48000,
        timeframe: '24h',
        indicators: {
          rsi: 58,
          macd: {
            value: 245.5,
            signal: 220.8,
            histogram: 24.7
          },
          volume24h: 28500000000,
          priceChange24h: 2.5
        },
        analysis: [
          'Strong accumulation pattern detected',
          'MACD showing bullish crossover',
          'Volume increasing with price'
        ]
      },
      {
        symbol: 'ETH',
        sentiment: 'bullish',
        confidence: 78,
        targetPrice: 3200,
        currentPrice: 2800,
        timeframe: '24h',
        indicators: {
          rsi: 62,
          macd: {
            value: 12.5,
            signal: 10.2,
            histogram: 2.3
          },
          volume24h: 15800000000,
          priceChange24h: 3.2
        },
        analysis: [
          'Breaking key resistance level',
          'Positive momentum building',
          'High institutional interest'
        ]
      },
      {
        symbol: 'SOL',
        sentiment: 'neutral',
        confidence: 65,
        targetPrice: 95,
        currentPrice: 90,
        timeframe: '24h',
        indicators: {
          rsi: 52,
          macd: {
            value: 0.8,
            signal: 0.9,
            histogram: -0.1
          },
          volume24h: 2400000000,
          priceChange24h: -0.5
        },
        analysis: [
          'Consolidating at support level',
          'Volume declining',
          'Wait for clear breakout'
        ]
      }
    ];

    setTimeout(() => {
      setSignals(mockSignals);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {signals.map((signal) => (
        <GlassCard
          key={signal.symbol}
          className="p-6"
          glowColor={
            signal.sentiment === 'bullish'
              ? 'rgba(0, 255, 153, 0.3)'
              : signal.sentiment === 'bearish'
              ? 'rgba(255, 0, 102, 0.3)'
              : 'rgba(0, 204, 255, 0.3)'
          }
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white">{signal.symbol}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-sm font-medium ${
                    signal.sentiment === 'bullish'
                      ? 'text-[#00ff99]'
                      : signal.sentiment === 'bearish'
                      ? 'text-[#ff0066]'
                      : 'text-[#00ccff]'
                  }`}>
                    {signal.sentiment.toUpperCase()}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-white">{signal.confidence}% Confidence</span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl ${
                signal.sentiment === 'bullish'
                  ? 'bg-[#00ff99]/20'
                  : signal.sentiment === 'bearish'
                  ? 'bg-[#ff0066]/20'
                  : 'bg-[#00ccff]/20'
              }`}>
                {signal.sentiment === 'bullish' ? (
                  <TrendingUp className="w-6 h-6 text-[#00ff99]" />
                ) : signal.sentiment === 'bearish' ? (
                  <TrendingDown className="w-6 h-6 text-[#ff0066]" />
                ) : (
                  <BarChart2 className="w-6 h-6 text-[#00ccff]" />
                )}
              </div>
            </div>

            {/* Price Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-400 text-sm">Current Price</span>
                <p className="text-white font-bold mt-1">
                  ${signal.currentPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Target Price</span>
                <p className="text-[#00ff99] font-bold mt-1">
                  ${signal.targetPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">24h Change</span>
                <p className={`font-bold mt-1 ${
                  signal.indicators.priceChange24h >= 0
                    ? 'text-[#00ff99]'
                    : 'text-[#ff0066]'
                }`}>
                  {signal.indicators.priceChange24h >= 0 ? '+' : ''}
                  {signal.indicators.priceChange24h}%
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">RSI</span>
                <p className={`font-bold mt-1 ${
                  signal.indicators.rsi > 70
                    ? 'text-[#ff0066]'
                    : signal.indicators.rsi < 30
                    ? 'text-[#00ff99]'
                    : 'text-white'
                }`}>
                  {signal.indicators.rsi}
                </p>
              </div>
            </div>

            {/* Analysis */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                <FiBrain className="text-[#00ccff]" />
                <span>AI Analysis</span>
              </h4>
              <div className="space-y-2">
                {signal.analysis.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ccff]" />
                    <p className="text-gray-400">{point}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
