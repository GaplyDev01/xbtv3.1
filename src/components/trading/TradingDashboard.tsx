'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SignalPreferences, TradingSignal, generateTradingSignals } from '@/services/tradingSignals';

export function TradingDashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<SignalPreferences>({
    timeframe: '24h',
    indicators: ['rsi', 'macd', 'bollinger'],
    minConfidence: 70,
    symbols: ['BTC', 'ETH', 'SOL'],
  });

  const updateSignals = async () => {
    try {
      setLoading(true);
      const newSignals = await generateTradingSignals(preferences);
      setSignals(newSignals);
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00ff99] to-[#00ccff]">
          Trading Dashboard
        </h2>
        <button
          onClick={updateSignals}
          className="px-6 py-2 bg-[#00ff99] text-black rounded-lg hover:bg-[#00ccff] hover:text-white transition-colors"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Signals'}
        </button>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {signals.map((signal, index) => (
          <motion.div
            key={`${signal.symbol}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl backdrop-blur-lg bg-white/5 border border-white/10 hover:border-[#00ff99]/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{signal.symbol}</h3>
                <p className="text-sm text-gray-400">{signal.timeframe} Analysis</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  signal.sentiment === 'bullish'
                    ? 'bg-green-500/20 text-green-400'
                    : signal.sentiment === 'bearish'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {signal.sentiment.charAt(0).toUpperCase() + signal.sentiment.slice(1)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Price</span>
                <span className="font-medium">${signal.currentPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Target Price</span>
                <span className="font-medium">${signal.targetPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Confidence</span>
                <span className="font-medium">{signal.confidence}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-sm font-medium mb-2">Analysis</h4>
              <ul className="space-y-1">
                {signal.analysis.map((point, i) => (
                  <li key={i} className="text-sm text-gray-400">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {signals.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            No trading signals available. Click &quot;Update Signals&quot; to generate new signals.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Generating trading signals...</p>
        </div>
      )}
    </div>
  );
}
