'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { TokenPriceChart } from '@/components/charts/TokenPriceChart';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

const TOKENS = [
  { symbol: 'SOL', name: 'Solana', price: 187.45, change24h: 5.23, volume24h: 2450000000, marketCap: 82450000000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3245.67, change24h: -1.23, volume24h: 12450000000, marketCap: 382450000000 },
  { symbol: 'BTC', name: 'Bitcoin', price: 52145.89, change24h: 2.45, volume24h: 32450000000, marketCap: 982450000000 },
];

interface MarketStatsProps {
  symbol: string;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MarketStats({ symbol, value, label, trend }: MarketStatsProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-[#00ff99]';
      case 'down':
        return 'text-[#ff0066]';
      default:
        return 'text-[#00ccff]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col space-y-1"
    >
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-xl font-bold ${getTrendColor()}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </motion.div>
  );
}

export function TradingDashboard() {
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOKENS.map((token) => (
              <GlassCard
                key={token.symbol}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedToken.symbol === token.symbol ? 'scale-105' : 'hover:scale-102'
                }`}
                glowColor={`${token.change24h >= 0 ? 'rgba(0, 255, 153, 0.3)' : 'rgba(255, 0, 102, 0.3)'}`}
                onClick={() => setSelectedToken(token)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{token.symbol}</h3>
                    <p className="text-sm text-gray-400">{token.name}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-sm font-medium ${
                    token.change24h >= 0 ? 'bg-[#00ff99]/20 text-[#00ff99]' : 'bg-[#ff0066]/20 text-[#ff0066]'
                  }`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Price</span>
                    <span className="text-xl font-bold text-white">
                      ${token.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Volume 24h</span>
                    <span className="text-white">
                      ${(token.volume24h / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>

                {/* Mini sparkline chart can be added here */}
              </GlassCard>
            ))}
          </div>

          {/* Detailed Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <TokenPriceChart
                symbol={selectedToken.symbol}
              />
            </div>

            {/* Trading Stats */}
            <div className="space-y-6">
              <GlassCard className="p-6" glowColor="rgba(0, 204, 255, 0.3)">
                <h3 className="text-xl font-bold text-white mb-6">Market Stats</h3>
                <div className="space-y-4">
                  <MarketStats
                    symbol={selectedToken.symbol}
                    value={`$${selectedToken.price.toLocaleString()}`}
                    label="Current Price"
                    trend={selectedToken.change24h >= 0 ? 'up' : 'down'}
                  />
                  <MarketStats
                    symbol={selectedToken.symbol}
                    value={`${selectedToken.change24h}%`}
                    label="24h Change"
                    trend={selectedToken.change24h >= 0 ? 'up' : 'down'}
                  />
                  <MarketStats
                    symbol={selectedToken.symbol}
                    value={`$${(selectedToken.volume24h / 1000000).toFixed(1)}M`}
                    label="24h Volume"
                  />
                  <MarketStats
                    symbol={selectedToken.symbol}
                    value={`$${(selectedToken.marketCap / 1000000000).toFixed(1)}B`}
                    label="Market Cap"
                  />
                </div>
              </GlassCard>

              <GlassCard className="p-6" glowColor="rgba(0, 255, 153, 0.3)">
                <h3 className="text-xl font-bold text-white mb-6">AI Signals</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sentiment</span>
                    <span className="text-[#00ff99] font-medium">Bullish</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Confidence</span>
                    <span className="text-white font-medium">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Target Price</span>
                    <span className="text-white font-medium">${(selectedToken.price * 1.15).toFixed(2)}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
