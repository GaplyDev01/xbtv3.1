'use client';

import { motion } from 'framer-motion';
import { FiActivity } from 'react-icons/fi';
import type { TechnicalIndicator } from '@/services/tradingSignals';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicator;
  selectedIndicators: string[];
}

export function TechnicalIndicators({ indicators, selectedIndicators }: TechnicalIndicatorsProps) {
  const getIndicatorColor = (value: number, type: string) => {
    switch (type) {
      case 'rsi':
        return value > 70 ? 'text-[#ff0066]' : value < 30 ? 'text-[#00ff99]' : 'text-white';
      case 'macd':
        return value > 0 ? 'text-[#00ff99]' : 'text-[#ff0066]';
      case 'volume':
        return 'text-[#00ccff]';
      default:
        return 'text-white';
    }
  };

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'volume24h':
        return `$${(value / 1e9).toFixed(2)}B`;
      case 'volatility':
        return `${value.toFixed(2)}%`;
      default:
        return value.toFixed(2);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <FiActivity className="text-[#00ccff]" />
        <h4 className="text-white font-medium">Technical Indicators</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {selectedIndicators.map((indicator, index) => {
          let value: number;
          let label: string;

          switch (indicator) {
            case 'rsi':
              value = indicators.rsi;
              label = 'RSI';
              break;
            case 'macd':
              value = indicators.macd.histogram;
              label = 'MACD Histogram';
              break;
            case 'ema20':
              value = indicators.ema20;
              label = 'EMA 20';
              break;
            case 'sma50':
              value = indicators.sma50;
              label = 'SMA 50';
              break;
            case 'sma200':
              value = indicators.sma200;
              label = 'SMA 200';
              break;
            case 'volume':
              value = indicators.volume24h;
              label = '24h Volume';
              break;
            case 'volatility':
              value = indicators.volatility;
              label = 'Volatility';
              break;
            default:
              return null;
          }

          return (
            <motion.div
              key={indicator}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-3"
            >
              <div className="text-sm text-gray-400">{label}</div>
              <div className={`text-lg font-bold mt-1 ${getIndicatorColor(value, indicator)}`}>
                {formatValue(value, indicator)}
              </div>
            </motion.div>
          );
        })}

        {selectedIndicators.includes('bollingerBands') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-lg p-3 col-span-2"
          >
            <div className="text-sm text-gray-400">Bollinger Bands</div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <div className="text-xs text-gray-400">Upper</div>
                <div className="text-[#00ff99] font-bold">
                  ${indicators.bollingerBands.upper.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Middle</div>
                <div className="text-white font-bold">
                  ${indicators.bollingerBands.middle.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Lower</div>
                <div className="text-[#ff0066] font-bold">
                  ${indicators.bollingerBands.lower.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
