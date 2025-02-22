'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { FollowUpOptions } from './FollowUpOptions';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const INITIAL_MESSAGE = {
  role: 'assistant' as const,
  content: 'Hello! I\'m TradesXBT, your AI trading assistant. I can help you with cryptocurrency analysis, market trends, and trading strategies. Remember that all information I provide is for educational purposes only - always do your own research (DYOR) and consider consulting with financial professionals for personalized advice. How can I assist you today?'
};

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useChat({
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Smart scroll handling
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Check if should show scroll button
  const checkScrollPosition = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', checkScrollPosition);
    return () => container.removeEventListener('scroll', checkScrollPosition);
  }, []);

  useEffect(() => {
    checkScrollPosition();
    scrollToBottom('auto');
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setInput('');
      await sendMessage(input);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle textarea height
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto mb-4 space-y-4 scroll-smooth"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white dark:from-emerald-600 dark:to-emerald-700'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <p className="whitespace-pre-wrap mb-2">{message.content}</p>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                {message.options && message.role === 'assistant' && (
                  <AnimatePresence mode="wait">
                    <FollowUpOptions
                      options={message.options}
                      onSelect={(option) => {
                        setInput(option.title);
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }}
                    />
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 p-4 rounded-lg">
              {error.message}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => scrollToBottom()}
              className="fixed bottom-24 right-8 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-black/70 transition-colors"
            >
              <ChevronDown size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="w-full p-4 pr-24 rounded-lg border-2 border-emerald-500/30 dark:border-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800/90 resize-none placeholder-gray-400 dark:placeholder-gray-500"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            Send
          </button>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearMessages}
            className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
          >
            Clear Chat
          </button>
        )}
      </form>
    </div>
  );
}
