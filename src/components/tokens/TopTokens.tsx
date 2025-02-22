'use client';

import { useEffect, useState } from 'react';
import { TokenService, TokenPrice } from '@/services/TokenService';
import { GlassCard } from '../ui/GlassCard';
import { LoadingSpinner } from '../loading/LoadingSpinner';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function TopTokens() {
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTokens = async () => {
      try {
        const data = await TokenService.getTopTokens(20);
        setTokens(data);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load top tokens');
        setIsLoading(false);
      }
    };

    fetchTopTokens();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  const getSparklineChartData = (prices: number[]) => {
    return {
      labels: Array.from({ length: prices.length }, (_, i) => i.toString()),
      datasets: [
        {
          data: prices,
          borderColor: '#00ff99',
          backgroundColor: 'rgba(0, 255, 153, 0.1)',
          borderWidth: 1,
          pointRadius: 0,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  if (error) {
    return (
      <GlassCard className="p-4">
        <div className="text-red-500">{error}</div>
      </GlassCard>
    );
  }

  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <LoadingSpinner />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Top Tokens</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-300">
              <th className="py-2 px-4">#</th>
              <th className="py-2 px-4">Token</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">24h Change</th>
              <th className="py-2 px-4">Market Cap</th>
              <th className="py-2 px-4">Last 7 Days</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <motion.tr
                key={token.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-white hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">{token.market_cap_rank}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-medium text-gray-300">
                      {token.symbol.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">{token.name}</span>
                    <span className="text-gray-400 uppercase">{token.symbol}</span>
                  </div>
                </td>
                <td className="py-4 px-4">{formatPrice(token.current_price)}</td>
                <td className="py-4 px-4">
                  <span
                    className={
                      token.price_change_percentage_24h >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {token.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  {formatMarketCap(token.market_cap)}
                </td>
                <td className="py-4 px-4">
                  <div className="w-32 h-16">
                    <Line
                      data={getSparklineChartData(token.sparkline_7d || [])}
                      options={sparklineOptions}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
