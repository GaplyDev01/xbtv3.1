'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  ChartData,
  ChartType,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Loader2 } from 'lucide-react';
import { TokenService, OHLCData } from '@/services/TokenService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TokenPriceChartProps {
  tokenId: string;
  height?: number;
}

interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
}

type TimeframeOption = '1H' | '24H' | '7D' | '30D' | '1Y';

export default function TokenPriceChart({
  tokenId,
  height = 400,
}: TokenPriceChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'line'>>(null);

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('24H');
  const [chartData, setChartData] = useState<ChartData<'line'> | null>(null);

  const formatPrice = (price: number) => {
    if (price < 0.0001) return price.toExponential(4);
    if (price < 1) return price.toFixed(8);
    if (price < 10) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  const fetchChartData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const days = {
        '1H': '1',
        '24H': '1',
        '7D': '7',
        '30D': '30',
        '1Y': '365',
      }[selectedTimeframe];

      const interval = selectedTimeframe === '1H' ? 'hourly' : 'daily';
      
      // First try to get OHLC data
      let ohlcData;
      try {
        ohlcData = await TokenService.getTokenOHLC(tokenId, days, interval);
      } catch (e) {
        console.error('Failed to get OHLC data:', e);
        // If it fails, try searching by token symbol
        ohlcData = await TokenService.getTokenOHLC(tokenId.toLowerCase(), days, interval);
      }

      if (!ohlcData?.length) {
        throw new Error('No price data available');
      }

      const formattedData: ChartData<'line'> = {
        labels: ohlcData.map((item: OHLCData) => {
          const date = new Date(item.time);
          return selectedTimeframe === '1H'
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }),
        datasets: [
          {
            type: 'line' as const,
            label: 'Price',
            data: ohlcData.map((item: OHLCData) => item.close),
            borderColor: '#00ff99',
            backgroundColor: 'rgba(0, 255, 153, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#00ff99',
            pointHoverBorderColor: '#fff',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          // Market cap and volume data not available in OHLC format
          {
            type: 'line' as const,
            label: 'Market Cap',
            data: ohlcData.map(item => item.close * (item.volume || 0)), // Rough estimate
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            yAxisID: 'marketCap',
            hidden: true,
          },
          {
            type: 'line' as const,
            label: 'Volume',
            data: ohlcData.map(item => item.volume || 0),
            backgroundColor: 'rgba(0, 255, 153, 0.2)',
            borderColor: 'rgba(0, 255, 153, 0.4)',
            borderWidth: 1,
            yAxisID: 'volume',
          },
        ],
      };

      setChartData(formattedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('Failed to load chart data');
      setIsLoading(false);
    }
  };



  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      y: {
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#00ff99',
          callback: (value: string | number) => `$${formatPrice(Number(value))}`,
        },
      },
      marketCap: {
        position: 'left',
        grid: {
          display: false,
        },
        ticks: {
          color: '#60a5fa',
          callback: (value) => formatMarketCap(value as number),
        },
      },
      volume: {
        position: 'left',
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(0, 255, 153, 0.6)',
          callback: (value) => formatMarketCap(value as number),
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#fff',
          font: {
            size: 12
          },
          filter: (item) => item.text !== 'Volume',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00ff99',
        bodyColor: '#fff',
        borderColor: '#00ff99',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label(context: any) {
            const value = context.parsed.y;
            if (typeof value !== 'number') return '';
            
            switch (context.dataset.yAxisID) {
              case 'volume':
                return `Volume: ${formatMarketCap(value)}`;
              case 'marketCap':
                return `Market Cap: ${formatMarketCap(value)}`;
              default:
                return `Price: $${formatPrice(value)}`;
            }
            return `Price: $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#666',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#666',
          callback(value: number) {
            return `$${value.toFixed(2)}`;
          }
        }
      },
      volume: {
        display: true,
        position: 'left',
        grid: {
          display: false
        },
        ticks: {
          color: '#666',
          callback(value: number) {
            return `$${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchChartData();
  }, [selectedTimeframe, tokenId]);

  return (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-xl z-10">
          <Loader2 className="w-6 h-6 animate-spin text-[#00ff99]" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-xl z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {(['1H', '24H', '7D', '30D', '1Y'] as const).map((tf) => (
          <button
            key={tf}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedTimeframe === tf
                ? 'bg-[#00ff99]/20 text-[#00ff99]'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
            }`}
            onClick={() => setSelectedTimeframe(tf)}
          >
            {tf}
          </button>
        ))}
      </div>

      {chartData && (
        <div className="h-[calc(100%-48px)]">
          <Line
            data={chartData}
            options={options}
            ref={chartRef}
          />
        </div>
      )}
    </div>
  );
}
