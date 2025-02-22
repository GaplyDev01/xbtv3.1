'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

const investmentOptions = [
  {
    id: 'conservative',
    name: 'Conservative',
    risk: 'Low',
    return: '8-12%',
    description: 'Focused on stable returns with minimal risk exposure.',
    allocation: {
      USDC: '40%',
      SOL: '30%',
      ETH: '20%',
      BTC: '10%',
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    risk: 'Medium',
    return: '15-25%',
    description: 'Balanced approach with moderate risk and growth potential.',
    allocation: {
      SOL: '40%',
      ETH: '30%',
      BTC: '20%',
      USDC: '10%',
    },
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    risk: 'High',
    return: '25-40%',
    description: 'Maximum growth potential with higher risk tolerance.',
    allocation: {
      SOL: '50%',
      ETH: '30%',
      BTC: '20%',
    },
  },
];

export default function InvestmentPage() {
  const [selectedOption, setSelectedOption] = useState(investmentOptions[1]);
  const [amount, setAmount] = useState('');

  const handleInvest = async () => {
    // TODO: Implement investment logic with Solana Web3.js
    console.log('Investing', amount, 'in', selectedOption.name);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-[#00ff99] to-[#00ccff] bg-clip-text text-transparent">
          Investment Options
        </h1>

        {/* Strategy Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {investmentOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedOption.id === option.id
                    ? 'border-2 border-[#00ff99]'
                    : 'border border-gray-800'
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level</span>
                    <span className="text-white">{option.risk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Return</span>
                    <span className="text-[#00ff99]">{option.return}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{option.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Selected Strategy Details */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">
            {selectedOption.name} Strategy Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(selectedOption.allocation).map(([token, percentage]) => (
              <div key={token} className="p-4 bg-gray-800/50 rounded-lg">
                <p className="text-lg font-bold text-white">{token}</p>
                <p className="text-[#00ff99]">{percentage}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Investment Form */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Make Investment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Investment Amount (USDC)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-900/50 text-white p-3 rounded-lg border border-gray-800 focus:border-[#00ff99] focus:outline-none"
                placeholder="Enter amount..."
              />
            </div>
            <motion.button
              onClick={handleInvest}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-[#00ff99]/20 text-[#00ff99] rounded-lg border border-[#00ff99]/50 hover:bg-[#00ff99]/30 transition-colors"
            >
              Invest Now
            </motion.button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
