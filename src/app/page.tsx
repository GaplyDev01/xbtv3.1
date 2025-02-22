'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ParticleBackground } from '@/components/effects/ParticleBackground';
import { Hero } from '@/components/sections/Hero';
import { TradingDashboard } from '@/components/trading/TradingDashboard';

// Dynamically import the WalletMultiButton with no SSR to prevent hydration issues
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected } = useWallet();

  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        {/* Animated background */}
        <ParticleBackground />

        {/* Main content */}
        <main className="relative z-10 container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key="home-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hero Section */}
              <Hero />

              {connected ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <TradingDashboard />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-col items-center gap-6 py-12"
                >
                  <h2 className="text-2xl font-bold text-center">
                    Connect your wallet to access the trading dashboard
                  </h2>
                  <div className="relative">
                    <WalletMultiButton className="!bg-[#00ff99] !text-black hover:!bg-[#00ccff] hover:!text-white transition-colors" />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-800 mt-12">
          <div className="container mx-auto px-4 py-6 text-center text-gray-400">
            <p>© 2025 Blockswarms. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
