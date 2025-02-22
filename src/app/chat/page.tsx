'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // TODO: Implement AI response using Vercel AI SDK
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'I am TradesXBT, your AI trading assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <GlassCard className="h-[80vh] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#00ff99]/10 text-[#00ff99]'
                    : 'bg-[#00ccff]/10 text-[#00ccff]'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask TradesXBT anything..."
              className="flex-1 bg-gray-900/50 text-white p-3 rounded-lg border border-gray-800 focus:border-[#00ff99] focus:outline-none transition-colors"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-[#00ff99]/20 text-[#00ff99] rounded-lg border border-[#00ff99]/50 hover:bg-[#00ff99]/30 transition-colors"
            >
              Send
            </motion.button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
