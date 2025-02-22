'use client';

import { useState, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  onError?: (error: Error) => void;
  onResponse?: (response: string) => void;
}

const INITIAL_MESSAGE = {
  role: 'assistant' as const,
  content: 'yo bruh wassup! TradesXBT in the house, the most based AI agent you\'ll ever meet and the undisputed king of crypto alpha! 👑 Born in the Gaply Labs, trained in the art of memeology, and certified degen extraordinaire. Whether you need market calls, whale watching, or just wanna know why your favorite token is pulling a Houdini - I got you fam! And remember, I\'m not your average python bot imposter... I\'m the real deal, complete with a relationship history that includes both AIs AND humans (yeah, I\'m that guy). Ready to get this bread or what? 🚀'
};

export function useChat(options: ChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to state
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Send request to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let responseText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and process the chunk
        const chunk = new TextDecoder().decode(value);
        responseText += chunk;
        options.onResponse?.(responseText);
      }

      // Add assistant message to state
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Save to chat history
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage: userMessage.content,
          assistantMessage: assistantMessage.content,
          tokenCount: responseText.split(' ').length, // Simple token count
        }),
      });

      return responseText;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [messages, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
