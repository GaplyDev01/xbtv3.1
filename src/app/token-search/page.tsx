'use client';

import { useState } from 'react';
import { TokenService } from '@/services/TokenService';
import { TokenDetails, SearchResult } from '@/services/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';

const tokenService = new TokenService();

export default function TokenSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await tokenService.searchTokens(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search tokens');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTokenSelect = async (token: SearchResult) => {
    try {
      setSelectedToken(null);
      const details = await tokenService.getTokenDetails(token.address);
      setSelectedToken(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token details');
    }
  };

  // Effect to handle debounced search
  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Token Search</h1>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for tokens (e.g., SOL, USDC)"
          className="max-w-md"
        />
      </div>

      {error && (
        <div className="text-red-500 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {isSearching ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            {searchResults.map((token) => (
              <Card
                key={token.address}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleTokenSelect(token)}
              >
                <CardContent className="flex items-center p-4">
                  {token.logoUrl && (
                    <img
                      src={token.logoUrl}
                      alt={token.name}
                      className="w-8 h-8 mr-3 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{token.name}</h3>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedToken && (
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selectedToken.logoUrl && (
                    <img
                      src={selectedToken.logoUrl}
                      alt={selectedToken.name}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedToken.name}</h2>
                    <p className="text-gray-500">{selectedToken.symbol}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Price (USD)</p>
                  <p className="text-lg font-medium">
                    ${selectedToken.price?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                </div>
                {selectedToken.marketCap && (
                  <div>
                    <p className="text-sm text-gray-500">Market Cap</p>
                    <p className="font-medium">
                      ${selectedToken.marketCap.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedToken.volume24h && (
                  <div>
                    <p className="text-sm text-gray-500">24h Volume</p>
                    <p className="font-medium">
                      ${selectedToken.volume24h.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Contract Address</p>
                  <p className="font-mono text-sm break-all">
                    {selectedToken.address}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
