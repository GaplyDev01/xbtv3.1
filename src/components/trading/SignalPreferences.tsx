'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiCheck } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import type { SignalPreferences } from '@/services/tradingSignals';

interface SignalPreferencesProps {
  preferences: SignalPreferences;
  onPreferencesChange: (preferences: SignalPreferences) => void;
}

const AVAILABLE_INDICATORS = [
  { id: 'rsi', name: 'RSI' },
  { id: 'macd', name: 'MACD' },
  { id: 'ema20', name: 'EMA 20' },
  { id: 'sma50', name: 'SMA 50' },
  { id: 'sma200', name: 'SMA 200' },
  { id: 'bollingerBands', name: 'Bollinger Bands' },
  { id: 'volume', name: 'Volume' },
  { id: 'volatility', name: 'Volatility' },
];

const POPULAR_SYMBOLS = ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX', 'DOT', 'ADA'];

export function SignalPreferences({ preferences, onPreferencesChange }: SignalPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeframeChange = (timeframe: SignalPreferences['timeframe']) => {
    onPreferencesChange({ ...preferences, timeframe });
  };

  const handleIndicatorToggle = (indicatorId: string) => {
    const newIndicators = preferences.indicators.includes(indicatorId)
      ? preferences.indicators.filter(id => id !== indicatorId)
      : [...preferences.indicators, indicatorId];
    onPreferencesChange({ ...preferences, indicators: newIndicators });
  };

  const handleSymbolToggle = (symbol: string) => {
    const newSymbols = preferences.symbols.includes(symbol)
      ? preferences.symbols.filter(s => s !== symbol)
      : [...preferences.symbols, symbol];
    onPreferencesChange({ ...preferences, symbols: newSymbols });
  };

  const handleConfidenceChange = (value: number) => {
    onPreferencesChange({ ...preferences, minConfidence: value });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
      >
        <FiSettings className="w-5 h-5" />
        <span>Preferences</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 mt-2 z-50 w-80"
        >
          <GlassCard className="p-4 space-y-6">
            {/* Timeframe Selection */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Timeframe</h3>
              <div className="grid grid-cols-4 gap-2">
                {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => handleTimeframeChange(timeframe)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      preferences.timeframe === timeframe
                        ? 'bg-[#00ccff] text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            {/* Indicators Selection */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Indicators</h3>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_INDICATORS.map((indicator) => (
                  <button
                    key={indicator.id}
                    onClick={() => handleIndicatorToggle(indicator.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded text-sm ${
                      preferences.indicators.includes(indicator.id)
                        ? 'bg-[#00ff99] text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {preferences.indicators.includes(indicator.id) && (
                      <FiCheck className="w-4 h-4" />
                    )}
                    <span>{indicator.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Symbol Selection */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Symbols</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SYMBOLS.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => handleSymbolToggle(symbol)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      preferences.symbols.includes(symbol)
                        ? 'bg-[#00ff99] text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Threshold */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">
                Minimum Confidence ({preferences.minConfidence}%)
              </h3>
              <input
                type="range"
                min="0"
                max="100"
                value={preferences.minConfidence}
                onChange={(e) => handleConfidenceChange(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
