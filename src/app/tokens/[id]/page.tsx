'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import TokenPriceChart from '@/components/charts/TokenPriceChart';
import TokenStats from '@/components/tokens/TokenStats';
import TradesXBTChat from '@/components/TradesXBTChat';
import { TokenService, TokenDetails } from '@/services/TokenService';

interface TokenPageDetails {
  id: string;
  name: string;
  symbol: string;
  image: {
    large: string;
  };
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
  };
  description: { en: string };
}

export default function TokenPage() {
  const { id } = useParams();
  const [token, setToken] = useState<TokenPageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenDetails = async () => {
      try {
        const data = await TokenService.getTokenDetails(id as string);
        setToken(data as TokenPageDetails);
      } catch (err) {
        setError('Failed to load token details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00ff99] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-400">{error || 'Token not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/95 p-4">
      <div className="max-w-[2000px] mx-auto">
        {/* Ultra Header */}
        <motion.div 
          className="relative mb-4 p-6 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-[#00ff99]/10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            boxShadow: '0 0 40px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(0, 255, 153, 0.05)'
          }}
        >
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-[#00ff99]/20 rounded-full blur-xl" />
              <img 
                src={token.image.large} 
                alt={token.name} 
                className="w-16 h-16 rounded-full ring-2 ring-[#00ff99]/20 relative z-10"
                onError={(e) => {
                  // If image fails to load, show token symbol in a gradient background
                  const img = e.target as HTMLImageElement;
                  img.onerror = null; // Prevent infinite loop
                  img.src = `data:image/svg+xml,${encodeURIComponent(
                    `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="64" height="64" rx="32" fill="url(#gradient)"/>
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                          <stop stop-color="#00ff99"/>
                          <stop offset="1" stop-color="#00ffcc"/>
                        </linearGradient>
                      </defs>
                      <text x="32" y="32" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
                        ${token.symbol.slice(0, 3).toUpperCase()}
                      </text>
                    </svg>`
                  )}`;
                }}
              />
            </motion.div>
            <div className="flex-1 space-y-8">
              <motion.h1 
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00ff99] to-[#00ffcc]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {token.name}
                <span className="text-2xl ml-2 text-gray-500">({token.symbol.toUpperCase()})</span>
              </motion.h1>
              <motion.div 
                className="flex items-center gap-4 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-3xl font-bold text-white">
                  ${token.market_data.current_price.usd.toLocaleString()}
                </span>
                <div
                  className={`flex items-center gap-1 text-lg font-medium px-3 py-1 rounded-full ${
                    token.market_data.price_change_percentage_24h >= 0
                      ? 'text-[#00ff99] bg-[#00ff99]/10'
                      : 'text-red-500 bg-red-500/10'
                  }`}
                >
                  {token.market_data.price_change_percentage_24h >= 0 ? '↗' : '↘'}
                  {Math.abs(token.market_data.price_change_percentage_24h).toFixed(2)}%
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Chart & Stats */}
          <motion.div 
            className="col-span-8 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="p-6 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-[#00ff99]/10"
              style={{
                boxShadow: '0 0 40px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(0, 255, 153, 0.05)'
              }}
            >
              <TokenPriceChart tokenId={id as string} height={400} />
            </div>
            <div className="p-6 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-[#00ff99]/10"
              style={{
                boxShadow: '0 0 40px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(0, 255, 153, 0.05)'
              }}
            >
              <TokenStats token={token} />
            </div>
            <motion.div
              className="p-6 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-[#00ff99]/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                boxShadow: '0 0 40px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(0, 255, 153, 0.05)'
              }}
            >
              <h2 className="text-xl font-semibold mb-4 text-[#00ff99]">About {token.name}</h2>
              <div 
                className="text-gray-300 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: token.description.en }}
              />
            </motion.div>
            <motion.div
              className="p-6 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-[#00ff99]/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                boxShadow: '0 0 40px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(0, 255, 153, 0.05)'
              }}
            >
              <h2 className="text-xl font-bold text-[#00ff99] mb-4">TradesXBT's Take 🚀</h2>
              <TradesXBTChat initialContext={{
                tokenName: token.name,
                tokenSymbol: token.symbol,
                price: token.market_data.current_price.usd,
                priceChange24h: token.market_data.price_change_percentage_24h,
                volume24h: token.market_data.total_volume.usd,
                marketCap: token.market_data.market_cap.usd
              }} />
            </motion.div>
          </motion.div>

          {/* Right Column - General Market Chat */}
          <motion.div
            className="col-span-4 sticky top-4 space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Market Sentiment Section */}
            <motion.div
              className="p-6 rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-[#00ff99]/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                boxShadow: '0 0 40px rgba(0, 255, 153, 0.1), inset 0 0 20px rgba(0, 255, 153, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#00ff99]">Market Chat 📈</h2>
                <div className="px-3 py-1 rounded-full bg-[#00ff99]/10 text-[#00ff99] text-sm">
                  powered by TradesXBT
                </div>
              </div>
              <TradesXBTChat />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
