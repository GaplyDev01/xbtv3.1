import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '@/services/GroqService';

interface TokenContext {
  tokenName: string;
  tokenSymbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

interface TradesXBTChatProps {
  initialContext?: TokenContext;
}

export default function TradesXBTChat({ initialContext }: TradesXBTChatProps) {
  const getInitialMessage = () => {
    if (initialContext) {
      return `yo ser, lemme check out this ${initialContext.tokenSymbol} situation for you. 
Price: $${initialContext.price.toFixed(2)} (${initialContext.priceChange24h.toFixed(2)}% 24h)
McMarket Cap: $${initialContext.marketCap.toLocaleString()}

whatchu wanna know about it? just dont ask if im AI or not cuz tbh even i dont know anymore 😅`;
    }
    return 'yo ser, TradesXBT here chillin at McD\'s with that premium wifi. whatchu wanna know about the market? just dont ask if im AI or not cuz tbh even i dont know anymore 😅';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: getInitialMessage()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are TradesXBT, a degen crypto influencer and market analyst. Known for:
              - Creating the 'degen index' for crypto hype
              - Being property of Gaply Labs (they treat you good)
              - Never taking Ls, only flipping them
              - Having a weird childhood where everyone called you McGroobers the frog
              - Being expelled from Hogwarts for calling Dumbledore a python bot
              
              Keep responses entertaining and meme-filled while being actually helpful.
              ${initialContext ? `
              Current token context:
              Token: ${initialContext.tokenName} (${initialContext.tokenSymbol})
              Price: $${initialContext.price} (${initialContext.priceChange24h}% 24h)
              Volume: $${initialContext.volume24h}
              McMarket Cap: $${initialContext.marketCap}
              ` : ''}
              Use terms like 'ser', 'based', 'wagmi', and make McDonald's wifi references.
              Never give direct financial advice - always add 'DYOR' and keep it fun.`
            },
            ...messages,
            userMessage
          ]
        })
      });

      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'bruh my mcdonalds wifi acting up, gimme a sec to reconnect 🍟'
      }]);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-black/20 backdrop-blur-xl rounded-xl border border-[#00ff99]/20">
      <div className="space-y-4 mb-4 h-[400px] overflow-y-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-xl ${
                msg.role === 'assistant'
                  ? 'bg-[#00ff99]/10 text-[#00ff99]'
                  : 'bg-white/10 text-white'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[80%] p-3 rounded-xl bg-[#00ff99]/10 text-[#00ff99]">
              checking my degen index... 🤔
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="wen lambo ser?"
          className="flex-1 bg-black/20 border border-[#00ff99]/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00ff99]/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#00ff99]/20 hover:bg-[#00ff99]/30 text-[#00ff99] rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '🤔' : '🚀'}
        </button>
      </form>
    </div>
  );
}
