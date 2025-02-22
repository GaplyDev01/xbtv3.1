'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { LoadingSpinner } from '../loading/LoadingSpinner';
import { api, TokenPrice } from '@/services/api';

interface MarketStats {
  total_market_cap: number;
  total_volume: number;
  market_cap_change_percentage_24h: number;
  btc_dominance: number;
}

export function MarketOverview() {
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [topGainers, setTopGainers] = useState<TokenPrice[]>([]);
  const [topLosers, setTopLosers] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const markets = await api.getMarketsData(1, 100);
        
        // Sort by 24h price change
        const sorted = [...markets].sort((a, b) => 
          b.price_change_percentage_24h - a.price_change_percentage_24h
        );

        setTopGainers(sorted.slice(0, 5));
        setTopLosers(sorted.slice(-5).reverse());
        
        // Calculate market stats
        const stats: MarketStats = {
          total_market_cap: markets.reduce((sum, token) => sum + token.market_cap, 0),
          total_volume: markets.reduce((sum, token) => sum + token.total_volume, 0),
          market_cap_change_percentage_24h: markets.reduce((sum, token) => 
            sum + (token.market_cap * token.price_change_percentage_24h) / token.market_cap, 0
          ) / markets.length,
          btc_dominance: (markets[0].market_cap / markets.reduce((sum, token) => 
            sum + token.market_cap, 0
          )) * 100
        };

        setMarketStats(stats);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Market Stats */}
      {marketStats && (
        <GlassCard className="p-6" glowColor="rgba(0, 204, 255, 0.3)">
          <h3 className="text-xl font-bold text-white mb-6">Market Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Market Cap</span>
              <span className="text-xl font-bold text-white">
                ${(marketStats.total_market_cap / 1e9).toFixed(2)}B
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-xl font-bold text-white">
                ${(marketStats.total_volume / 1e9).toFixed(2)}B
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Market Change (24h)</span>
              <span className={`text-xl font-bold ${
                marketStats.market_cap_change_percentage_24h >= 0 
                  ? 'text-[#00ff99]' 
                  : 'text-[#ff0066]'
              }`}>
                {marketStats.market_cap_change_percentage_24h >= 0 ? '+' : ''}
                {marketStats.market_cap_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">BTC Dominance</span>
              <span className="text-xl font-bold text-white">
                {marketStats.btc_dominance.toFixed(2)}%
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Top Gainers */}
      <GlassCard className="p-6" glowColor="rgba(0, 255, 153, 0.3)">
        <h3 className="text-xl font-bold text-white mb-6">Top Gainers (24h)</h3>
        <div className="space-y-4">
          {topGainers.map((token) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <div className="flex items-center space-x-2">
                <FiTrendingUp className="text-[#00ff99]" />
                <span className="text-white">{token.symbol.toUpperCase()}</span>
              </div>
              <span className="text-[#00ff99] font-bold">
                +{token.price_change_percentage_24h.toFixed(2)}%
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Top Losers */}
      <GlassCard className="p-6" glowColor="rgba(255, 0, 102, 0.3)">
        <h3 className="text-xl font-bold text-white mb-6">Top Losers (24h)</h3>
        <div className="space-y-4">
          {topLosers.map((token) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center"
            >
              <div className="flex items-center space-x-2">
                <FiTrendingDown className="text-[#ff0066]" />
                <span className="text-white">{token.symbol.toUpperCase()}</span>
              </div>
              <span className="text-[#ff0066] font-bold">
                {token.price_change_percentage_24h.toFixed(2)}%
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
