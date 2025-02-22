'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const portfolioData = {
  labels: ['SOL', 'ETH', 'BTC', 'USDC'],
  datasets: [
    {
      data: [40, 30, 20, 10],
      backgroundColor: [
        'rgba(0, 255, 153, 0.8)',
        'rgba(0, 204, 255, 0.8)',
        'rgba(157, 0, 255, 0.8)',
        'rgba(255, 0, 102, 0.8)',
      ],
      borderColor: [
        'rgba(0, 255, 153, 1)',
        'rgba(0, 204, 255, 1)',
        'rgba(157, 0, 255, 1)',
        'rgba(255, 0, 102, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const stats = [
  { label: 'Total Value', value: '$125,432.89', change: '+12.5%' },
  { label: 'Monthly Profit', value: '$15,432.89', change: '+8.3%' },
  { label: 'Annual Return', value: '32.5%', change: '+15.2%' },
  { label: 'Risk Score', value: '7.2/10', change: '-0.3' },
];

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portfolio Overview */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#00ff99] to-[#00ccff] bg-clip-text text-transparent">
            Portfolio Overview
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-800/50 rounded-lg"
              >
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className={`text-sm ${
                  stat.change.startsWith('+') ? 'text-[#00ff99]' : 'text-[#ff0066]'
                }`}>
                  {stat.change}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="h-64">
            <Doughnut
              data={portfolioData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#fff',
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#00ff99] to-[#00ccff] bg-clip-text text-transparent">
            Recent Transactions
          </h2>
          <div className="space-y-4">
            {[
              { type: 'Buy', token: 'SOL', amount: '10.5', price: '$150.32', timestamp: '2h ago' },
              { type: 'Sell', token: 'ETH', amount: '2.3', price: '$3,245.67', timestamp: '5h ago' },
              { type: 'Buy', token: 'BTC', amount: '0.15', price: '$52,145.89', timestamp: '1d ago' },
            ].map((tx, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${
                    tx.type === 'Buy' ? 'text-[#00ff99]' : 'text-[#ff0066]'
                  }`}>
                    {tx.type}
                  </span>
                  <span className="text-white">{tx.token}</span>
                </div>
                <div className="text-right">
                  <p className="text-white">{tx.amount} {tx.token}</p>
                  <p className="text-sm text-gray-400">{tx.price}</p>
                  <p className="text-xs text-gray-500">{tx.timestamp}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
