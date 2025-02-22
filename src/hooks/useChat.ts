'use client';

import { useState, useCallback } from 'react';

import type { FollowUpOption } from '@/components/chat/FollowUpOptions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  options?: FollowUpOption[];
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
      let response;
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              // Only send the most recent messages to keep context but ensure proper alternation
              ...messages.slice(-4).filter((msg, index, arr) => {
                // Keep system messages and ensure proper user/assistant alternation
                if (msg.role === 'system') return true;
                if (index === 0) return true; // Keep first message
                return msg.role !== arr[index - 1].role; // Ensure alternation
              }),
              userMessage
            ],
          }),
        });
      } catch (error) {
        throw new Error('Failed to connect to chat service. Please check your internet connection.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Chat service error (${response.status}). Please try again.`
        );
      }

      if (!response.body) {
        throw new Error('No response from chat service. Please try again.');
      }

      // Handle streaming response with improved error handling
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      let lastChunkTime = Date.now();

      try {
        const TIMEOUT_MS = 10000; // 10 second timeout between chunks

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            if (!responseText.trim()) {
              throw new Error('Stream ended without any data');
            }
            break;
          }

          // Check for timeout between chunks
          const now = Date.now();
          if (now - lastChunkTime > TIMEOUT_MS) {
            throw new Error('Stream timeout - no data received for 10 seconds');
          }
          lastChunkTime = now;

          // Decode and process the chunk
          const chunk = decoder.decode(value);
          if (!chunk.trim()) continue; // Skip empty chunks
          
          // Check for follow-up options
          if (chunk.includes('<<FOLLOW_UP_OPTIONS>>')) {
            // Use [\s\S] instead of /s flag for cross-version compatibility
            const optionsMatch = chunk.match(/<<FOLLOW_UP_OPTIONS>>([\s\S]+?)<<END_OPTIONS>>/);
            if (optionsMatch) {
              const options = JSON.parse(optionsMatch[1]);
              // Store options to be added to the message later
              responseText = responseText.replace(/<<FOLLOW_UP_OPTIONS>>([\s\S]+?)<<END_OPTIONS>>/, '');
              setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, options: options.options }
                  ];
                }
                return prev;
              });
              continue;
            }
          }

          // Accumulate response text directly since server sends plain text
          responseText += chunk;
          
          options.onResponse?.(responseText);
        }
      } catch (error) {
        throw new Error('Error reading chat response. Please try again.');
      }

      if (!responseText.trim()) {
        throw new Error('Received empty response from chat service. Please try again.');
      }

      // Add assistant message to state
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseText,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Save to chat history
      try {
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
      } catch (error) {
        console.error('Failed to save chat history:', error);
        // Don't throw here - chat history failure shouldn't break the chat experience
      }

      return responseText;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Chat error:', error);
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
