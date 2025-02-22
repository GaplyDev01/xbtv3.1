'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ChatInterface } from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <GlassCard className="h-[80vh] flex flex-col">
        <div className="flex-1 overflow-hidden">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#00ff99]">
            TradesXBT AI Assistant
          </h1>
          <ChatInterface />
        </div>
      </GlassCard>
    </div>
  );
}
