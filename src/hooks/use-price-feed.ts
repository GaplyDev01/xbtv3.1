import { useState, useEffect, useCallback } from 'react';
import { TokenService } from '@/services/TokenService';

interface TokenData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
}

interface UsePriceFeedResult {
  tokenData: TokenData | null;
  error: string | null;
  loading: boolean;
  searchTokens: (query: string) => Promise<Array<{ id: string; symbol: string; name: string }>>;
}

export function usePriceFeed(tokenId: string): UsePriceFeedResult {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTokenData = async () => {
      if (!tokenId) return;
      
      setLoading(true);
      setError(null);

      try {
        const data = await TokenService.fetchTokenData(tokenId);

        if (error) throw error;

        if (isMounted && data) {
          setTokenData(data as TokenData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch token data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTokenData();

    // Set up polling for updates
    const pollInterval = setInterval(async () => {
      if (isMounted) {
        const data = await TokenService.fetchTokenData(tokenId);
        if (data) {
          setTokenData(data as TokenData);
        }
      }
    }, 20000); // Poll every 20 seconds to match CoinGecko Pro update frequency

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [tokenId]);

  const searchTokens = useCallback(async (query: string) => {
    try {
      const data = await TokenService.searchTokens(query);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }, []);

  return { tokenData, error, loading, searchTokens };
}
