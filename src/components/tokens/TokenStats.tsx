import { motion } from 'framer-motion';

interface TokenStatsProps {
  token: {
    market_data: {
      market_cap: { usd: number };
      total_volume: { usd: number };
      high_24h: { usd: number };
      low_24h: { usd: number };
    };
  };
}

export default function TokenStats({ token }: TokenStatsProps) {
  const stats = [
    {
      label: 'Market Cap',
      value: `$${token.market_data.market_cap.usd.toLocaleString()}`,
    },
    {
      label: '24h Volume',
      value: `$${token.market_data.total_volume.usd.toLocaleString()}`,
    },
    {
      label: '24h High',
      value: `$${token.market_data.high_24h.usd.toLocaleString()}`,
    },
    {
      label: '24h Low',
      value: `$${token.market_data.low_24h.usd.toLocaleString()}`,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">Market Stats</h2>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-gray-400">{stat.label}</span>
            <span className="text-white font-medium">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
