'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Settings2, ArrowUp, ArrowDown, TrendingUp, BarChart2, PanelLeft, PanelRight, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';
import { usePriceFeed } from '@/hooks/use-price-feed';
import { useChat } from '@/hooks/use-chat';
import { useDebounce } from '@/hooks/use-debounce';
import { SearchBar } from '@/components/search/SearchBar';
import { TokenService } from '@/services/TokenService';
import { ChatMessage } from '@/types/chat';

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

export default function TokensPage() {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [selectedToken, setSelectedToken] = useState<TokenResult | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<TokenResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearch = useDebounce(handleSearch, 300);
  const { sendMessage } = useChat();
  const { subscribeToPrice, unsubscribeFromPrice } = usePriceFeed();
  
  useEffect(() => {
    if (selectedToken?.id) {
      subscribeToPrice(selectedToken.id);
      return () => unsubscribeFromPrice(selectedToken.id);
    }
  }, [selectedToken?.id]);

  async function handleSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await TokenService.searchTokens(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching tokens:', error);
    } finally {
      setIsSearching(false);
    }
  }

  const handleTokenSelect = (token: TokenResult) => {
    setSelectedToken(token);
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedToken) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: message,
    };

    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');
    setChatLoading(true);

    try {
      const response = await sendMessage(message, selectedToken.id);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0D1117] text-white overflow-hidden">
      {/* Left Panel - Token Search */}
      <div
        className={cn(
          'w-80 border-r border-[#21262D] p-4 transition-all duration-300 ease-in-out',
          showLeftPanel ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-4">
          <SearchBar
            placeholder="Search tokens..."
            onChange={(e) => debouncedSearch(e.target.value)}
            loading={isSearching}
          />
          
          <div className="space-y-2">
            {searchResults.map((token) => (
              <button
                key={token.id}
                onClick={() => handleTokenSelect(token)}
                className="w-full p-3 text-left bg-[#161B22] hover:bg-[#1C2127] rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{token.name}</span>
                  <span className="text-sm text-gray-400">{token.symbol.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm">${token.price.toFixed(2)}</span>
                  <span
                    className={cn(
                      'text-sm',
                      token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {token.price_change_24h >= 0 ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(token.price_change_24h).toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Token Info Header */}
        {selectedToken && (
          <div className="p-4 border-b border-[#21262D] bg-[#161B22]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedToken.name}</h2>
                <p className="text-gray-400">{selectedToken.symbol.toUpperCase()}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg">${selectedToken.price.toFixed(2)}</p>
                  <p
                    className={cn(
                      'flex items-center',
                      selectedToken.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {selectedToken.price_change_24h >= 0 ? (
                      <ArrowUp className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDown className="w-4 h-4 mr-1" />
                    )}
                    {Math.abs(selectedToken.price_change_24h).toFixed(2)}%
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" className="bg-[#1C2620]/40 hover:bg-[#243830]">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Trade
                  </Button>
                  <Button variant="ghost" className="bg-[#1C2620]/40 hover:bg-[#243830]">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Analysis
                  </Button>
                  <Button variant="ghost" className="bg-[#1C2620]/40 hover:bg-[#243830]">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={cn(
                'max-w-3xl mx-auto p-4 rounded-lg',
                msg.role === 'user'
                  ? 'bg-[#1C2620] ml-auto'
                  : 'bg-[#161B22] mr-auto'
              )}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-[#21262D] bg-[#161B22]">
          <div className="max-w-3xl mx-auto flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about this token..."
              className="flex-1 bg-[#0D1117] border border-[#21262D] rounded-lg px-4 py-2 focus:outline-none focus:border-[#388BFD]"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
          {showLeftPanel ? <PanelLeft className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
