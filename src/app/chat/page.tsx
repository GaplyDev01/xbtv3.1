'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-emerald-900 to-gray-900 px-4 py-8">
      <div className="container mx-auto">
        <GlassCard className="min-h-[80vh] flex flex-col backdrop-blur-xl bg-white/10 dark:bg-gray-900/30 border border-emerald-500/20">
          <div className="flex-1 overflow-hidden">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              TradesXBT AI Assistant
            </h1>
            <ChatInterface />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
