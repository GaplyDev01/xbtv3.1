'use client';

import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 0.5,
    scale: 1,
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      times: [0, 0.5, 1],
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1]
    }
  }
};

const titleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

import { useState } from 'react';
import { TokenService } from '@/services/TokenService';

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

export function Hero() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await TokenService.searchTokens(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tokens:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center py-20">
      {/* Background glow effects */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,153,0.1) 0%, rgba(0,255,153,0) 70%)',
        }}
        variants={glowVariants}
        initial="initial"
        animate="animate"
      />
      
      {/* Content */}
      <motion.div
        className="relative z-10 text-center space-y-8"
        variants={titleVariants}
        initial="initial"
        animate="animate"
      >
        {/* Main title with animated gradient */}
        <h1 className="text-5xl md:text-7xl font-bold">
          <span className="inline-block bg-gradient-to-r from-[#00ff99] via-[#00ccff] to-[#ff0066] bg-clip-text text-transparent animate-text-shimmer">
            Blockswarms
          </span>
        </h1>

        {/* Animated subtitle */}
        <motion.p
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Next-generation AI-powered hedge fund built on{' '}
          <span className="text-[#00ff99]">Solana</span>
        </motion.p>

        {/* Search bar with animated container */}
        <motion.div
          className="max-w-2xl w-full mx-auto px-4 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search Solana tokens..."
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <motion.div 
              className="absolute w-full mt-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden shadow-xl z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-0 cursor-pointer"
                  onClick={() => window.location.href = `/tokens/${result.id}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={result.thumb} alt={result.name} className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{result.name}</h3>
                      <p className="text-sm text-gray-400">{result.symbol.toUpperCase()}</p>
                    </div>
                    {result.market_cap_rank && (
                      <span className="text-sm text-gray-400">Rank #{result.market_cap_rank}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Loading State */}
          {isSearching && (
            <motion.div 
              className="absolute w-full mt-2 p-4 text-center bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#00ff99] border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">Searching Solana tokens...</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto px-4 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {[
            { label: 'Total Value Locked', value: '$1.2B' },
            { label: 'Active Traders', value: '50K+' },
            { label: 'AI Accuracy', value: '94%' },
            { label: 'Daily Volume', value: '$150M' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
