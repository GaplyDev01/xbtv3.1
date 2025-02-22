'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';

interface Insight {
  id: number;
  title: string;
  description: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

const sampleInsights: Insight[] = [
  {
    id: 1,
    title: 'Market Trend Analysis',
    description: 'Strong bullish momentum detected in SOL. Key resistance levels have been broken.',
    sentiment: 'bullish',
    confidence: 0.85,
  },
  {
    id: 2,
    title: 'Risk Alert',
    description: 'Increased volatility expected in the next 24 hours. Consider adjusting position sizes.',
    sentiment: 'neutral',
    confidence: 0.75,
  },
  {
    id: 3,
    title: 'Trading Opportunity',
    description: 'Bearish divergence spotted on multiple timeframes. Consider taking profits.',
    sentiment: 'bearish',
    confidence: 0.82,
  },
];

export function AIInsightsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [insights, setInsights] = useState(sampleInsights);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % insights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const currentInsight = insights[currentIndex];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return '#00ff99';
      case 'bearish':
        return '#ff0066';
      default:
        return '#00ccff';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-white mb-4">AI Market Insights</h2>
      <div className="relative h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute w-full"
          >
            <GlassCard
              className="p-6"
              glowColor={`${getSentimentColor(currentInsight.sentiment)}40`}
              neonBorder
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">{currentInsight.title}</h3>
                <div
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${getSentimentColor(currentInsight.sentiment)}20`, 
                          color: getSentimentColor(currentInsight.sentiment) }}
                >
                  {currentInsight.sentiment.charAt(0).toUpperCase() + currentInsight.sentiment.slice(1)}
                </div>
              </div>
              
              <p className="text-gray-300 mb-4">{currentInsight.description}</p>
              
              <div className="flex items-center">
                <div className="text-sm text-gray-400">AI Confidence:</div>
                <div className="ml-2 flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getSentimentColor(currentInsight.sentiment) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentInsight.confidence * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </div>
                <div className="ml-2 text-sm font-medium" 
                     style={{ color: getSentimentColor(currentInsight.sentiment) }}>
                  {Math.round(currentInsight.confidence * 100)}%
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {insights.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              index === currentIndex ? 'bg-[#00ff99]' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
