'use client';

import { HTMLAttributes } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MarketCardProps extends HTMLAttributes<HTMLDivElement> {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  aiSentiment?: 'bullish' | 'bearish' | 'neutral';
}

export function MarketCard({
  symbol,
  price,
  change24h,
  volume24h,
  marketCap,
  aiSentiment = 'neutral',
  className,
  ...props
}: MarketCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'rgba(34,197,94,0.3)'; // green
      case 'bearish':
        return 'rgba(239,68,68,0.3)'; // red
      default:
        return 'rgba(148,163,184,0.3)'; // slate
    }
  };

  return (
    <GlassCard
      className={cn('p-6 w-full', className)}
      glowColor={getSentimentColor(aiSentiment)}
      {...props}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">{symbol}</h3>
        <div className="flex items-center space-x-2">
          <span className={cn(
            'px-2 py-1 rounded text-sm',
            aiSentiment === 'bullish' && 'bg-green-500/20 text-green-400',
            aiSentiment === 'bearish' && 'bg-red-500/20 text-red-400',
            aiSentiment === 'neutral' && 'bg-slate-500/20 text-slate-400'
          )}>
            {aiSentiment.charAt(0).toUpperCase() + aiSentiment.slice(1)}
          </span>
        </div>
      </div>

      {/* Price and Change */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-slate-400">Price</p>
          <p className="text-2xl font-bold text-white">{formatNumber(price)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">24h Change</p>
          <p className={cn('text-2xl font-bold', getChangeColor(change24h))}>
            {formatPercentage(change24h)}
          </p>
        </div>
      </div>

      {/* Volume and Market Cap */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-400">24h Volume</p>
          <p className="text-lg text-white">{formatNumber(volume24h)}</p>
        </div>
        {marketCap && (
          <div>
            <p className="text-sm text-slate-400">Market Cap</p>
            <p className="text-lg text-white">{formatNumber(marketCap)}</p>
          </div>
        )}
      </div>

      {/* AI Sentiment Indicator */}
      <motion.div 
        className="absolute bottom-0 left-0 w-full h-1"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={cn(
          'h-full',
          aiSentiment === 'bullish' && 'bg-green-400',
          aiSentiment === 'bearish' && 'bg-red-400',
          aiSentiment === 'neutral' && 'bg-slate-400'
        )} />
      </motion.div>
    </GlassCard>
  );
}
