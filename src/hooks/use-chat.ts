import { useState, useCallback } from 'react';
import { ChatMessage } from '@/types/chat';

interface ChatOptions {
  initialMessages?: ChatMessage[];
  onError?: (error: Error) => void;
}

export function useChat({ initialMessages = [], onError }: ChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (message: Omit<ChatMessage, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        ...message,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Simulate AI response (replace with actual API call)
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I am analyzing the market data for you...',
        metadata: {
          analysisType: message.metadata?.analysisType,
          tokenId: message.metadata?.tokenId,
        },
      };
      setMessages((prev) => [...prev, aiResponse]);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
