import { useState, useCallback } from 'react';
import { db } from '@/services/DatabaseService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  onError?: (error: Error) => void;
  onResponse?: (response: string) => void;
}

export function useChat(options: ChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
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

      // Save to database
      await db.query(
        `INSERT INTO chat_history (user_message, assistant_message, created_at)
         VALUES ($1, $2, NOW())`,
        userMessage.content,
        assistantMessage.content
      );

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
