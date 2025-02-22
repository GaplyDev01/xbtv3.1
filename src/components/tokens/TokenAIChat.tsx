'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TokenAIChatProps {
  tokenId: string;
  tokenName: string;
}

export default function TokenAIChat({ tokenId, tokenName }: TokenAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm TradesXBT, your AI trading companion. Ask me anything about ${tokenName} - from technical analysis to market insights!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // TODO: Implement AI response logic
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Here's my analysis of ${tokenName} based on your question about "${input}". [AI response to be implemented]`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-800 bg-gray-900/40">
        <h2 className="text-xl font-bold tracking-wider bg-gradient-to-r from-[#e8fff2] to-[#c3fce3] text-transparent bg-clip-text">TradesXBT</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-[#00ff99]/10 text-white'
                    : 'bg-gray-800/50 text-gray-200'
                }`}
              >
                <p>{message.content}</p>
                <span className="text-xs text-gray-500 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800/50 p-4 rounded-xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about market analysis, trends, or trading signals..."
            className="flex-1 bg-gray-800/50 text-white placeholder-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ff99]/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-[#00ff99]/20 text-[#00ff99] px-6 py-2 rounded-lg font-medium hover:bg-[#00ff99]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
