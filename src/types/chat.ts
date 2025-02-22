export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    analysisType?: string;
    tokenId?: string;
    price?: number;
    trend?: string;
    indicators?: {
      rsi?: number;
      macd?: number;
    };
    links?: string[];
  };
}
