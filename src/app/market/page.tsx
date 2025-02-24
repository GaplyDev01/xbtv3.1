import TokenPriceChart from '@/components/charts/TokenPriceChart';
import { TopTokens } from '@/components/tokens/TopTokens';

export default function MarketPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <TokenPriceChart tokenId="bitcoin" />
      <TopTokens />
    </div>
  );
}
