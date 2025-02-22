'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Settings2, ArrowUp, ArrowDown, TrendingUp, LineChart, PanelLeftClose, PanelRightClose, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import { usePriceFeed } from '@/hooks/use-price-feed';
import { useChat } from '@/hooks/use-chat';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchBar } from '@/components/search/SearchBar';
import { TokenService } from '@/services/TokenService';
import { ChatMessage } from '@/types/chat';

// ... [Previous interfaces remain the same]

interface MarketData {
  price: number;
  trend: 'up' | 'down';
  rsi: number;
  macd: number;
}

interface TokenResult {
  id: string;
  name: string;
  symbol: string;
  price: number;
  price_change_24h: number;
}

export default function MarketAnalysis() {
  const [message, setMessage] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenResult[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [marketData, setMarketData] = useState<MarketData>({
    price: 0,
    trend: 'up',
    rsi: 50,
    macd: 0
  });
  // Update the useChat hook usage to match our implementation
  const { messages, isLoading: chatLoading, sendMessage, error: chatError } = useChat({
    initialMessages: [],
    onError: (err) => {
      console.error('Chat error:', err);
    }
  });

  // Handle message sending with our chat system
  const handleSendMessage = async () => {
    if (!message.trim() || chatLoading) return;
    
    try {
      const currentMessage = message;
      setMessage('');
      
      await sendMessage({
        content: currentMessage,
        role: 'user',
        metadata: {
          tokenId: selectedTokenId,
          price: marketData.price,
          trend: marketData.trend,
          indicators: {
            rsi: marketData.rsi,
            macd: marketData.macd
          }
        }
      });
      
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle token selection with integrated chat
  const handleSelectToken = useCallback(async (tokenId: string) => {
    setSelectedTokenId(tokenId);
    setSearchQuery('');
    setShowSearchResults(false);
    
    try {
      const data = await TokenService.fetchTokenData(tokenId);
      if (data) {
        // Send market analysis request through our chat system
        sendMessage({
          content: `Provide a comprehensive market analysis for ${data.name} (${data.symbol})`,
          role: 'user',
          metadata: {
            analysisType: 'comprehensive',
            tokenId: tokenId,
            marketData: {
              price: data.price,
              change24h: data.price_change_24h,
              volume24h: data.volume_24h,
              marketCap: data.market_cap
            }
          }
        });
      }
    } catch (err) {
      console.error('Error fetching token data:', err);
    }
  }, [sendMessage]);

  // Render chat messages with our styling
  const renderChatMessage = (msg: ChatMessage) => (
    <Card 
      key={msg.id}
      className={cn(
        'p-4',
        msg.role === 'user' 
          ? 'bg-[#243830] border-[#36C58C]/20 ml-12' 
          : 'bg-[#1C2620]/40 border-[#36C58C]/20 mr-12'
      )}
    >
      <p className="text-sm text-gray-400 mb-1">
        {msg.role === 'user' ? 'You' : 'TradesXBT'}
      </p>
      <div className="text-white whitespace-pre-wrap">{msg.content}</div>
      {msg.metadata?.links?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#36C58C]/20">
          <p className="text-sm text-gray-400 mb-2">References:</p>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {msg.metadata.links.map((link: string, i: number) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-[#36C58C] hover:underline break-words bg-[#1C2620]/40 p-2 rounded hover:bg-[#243830] transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#181719] text-white flex">
      {/* Left Panel - Market Overview */}
      <div className={`w-[400px] bg-[#1C2620]/40 border-r border-[#36C58C]/20 transition-all duration-300 ${
        showLeftPanel ? 'translate-x-0' : '-translate-x-[360px]'
      }`}>
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Market Overview</h2>
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search tokens..."
          />
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleSelectToken(token.id)}
                  className="w-full p-3 text-left bg-[#243830] hover:bg-[#2c4339] rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-gray-400">{token.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${token.price.toFixed(2)}</p>
                      <p className={cn(
                        'text-sm',
                        token.price_change_24h > 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {token.price_change_24h > 0 ? '+' : ''}{token.price_change_24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Chat Messages */}
        <div 
          className="flex-1 overflow-y-auto p-6 scroll-smooth"
          id="chat-messages"
          style={{ height: 'calc(100vh - 144px)' }}
        >
          <div className="max-w-3xl mx-auto space-y-4 flex flex-col">
            {messages.map((msg) => renderChatMessage(msg))}
            {chatLoading && (
              <Card className="bg-[#1C2620]/40 border-[#36C58C]/20 p-4 mr-12 animate-pulse mt-4">
                <p className="text-gray-400">AI Assistant is thinking...</p>
              </Card>
            )}
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-[#36C58C]/20 p-6 bg-[#181719]">
          <div className="max-w-3xl mx-auto flex gap-4">
            <input
              type="text"
              placeholder="Ask about market analysis..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="flex-1 bg-[#1C2620]/60 border-[#36C58C]/50 text-white placeholder:text-gray-500 rounded-md px-4 py-2"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={chatLoading || !message.trim()}
              className="bg-[#36C58C] hover:bg-[#36C58C]/90 text-black"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Toggle Panel Controls */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <Button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          variant="ghost"
          className="bg-[#1C2620]/40 hover:bg-[#243830] text-white"
        >
          {showLeftPanel ? <PanelLeftClose className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
