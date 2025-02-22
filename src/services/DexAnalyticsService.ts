import axios from 'axios';

const QUICKNODE_API_KEY = process.env.QUICK_NODE_API_KEY;
const QUICKNODE_URL = process.env.QUICK_NODE_URL;

if (!QUICKNODE_API_KEY || !QUICKNODE_URL) {
  console.error('QuickNode configuration missing. Please check your .env file');
}

export interface DexProgramMetrics {
  name: string;
  invocations: number;
  transactions: number;
  valueChange: string;
  successfulTxs: number;
  failedTxs: number;
  uniqueUserCount: number;
  transactionShare: string;
  successRate: string;
}

export interface DexAnalytics {
  message: string;
  blockTime: number;
  slot: number;
  programs: {
    [key: string]: DexProgramMetrics;
  };
  totalDexTransactions: number;
  totalValueChange: string;
}

export const DEX_PROGRAMS = {
  PHOENIX: 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',
  RAYDIUM_CLM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  JUPITER: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
} as const;

export class DexAnalyticsService {
  /**
   * Get DEX analytics for a specific block
   * @param blockNumber Optional block number, defaults to latest
   * @returns DexAnalytics data
   */
  static async getDexAnalytics(blockNumber?: number): Promise<DexAnalytics> {
    try {
      const response = await axios.post(
        `${QUICKNODE_URL}?result_only=true`,
        {
          network: 'solana-mainnet',
          dataset: 'programs_with_logs',
          ...(blockNumber && { block_number: blockNumber })
        },
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': QUICKNODE_API_KEY!
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching DEX analytics:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  /**
   * Get historical DEX analytics
   * @param startBlock Starting block number
   * @param endBlock Ending block number
   * @param interval Number of blocks between each data point
   * @returns Array of DexAnalytics data points
   */
  static async getHistoricalDexAnalytics(
    startBlock: number,
    endBlock: number,
    interval: number = 1000
  ): Promise<DexAnalytics[]> {
    const blocks = [];
    for (let block = startBlock; block <= endBlock; block += interval) {
      blocks.push(block);
    }

    const analytics = await Promise.all(
      blocks.map(block => this.getDexAnalytics(block))
    );

    return analytics;
  }

  /**
   * Get DEX market share analysis
   * @param blockNumber Optional block number
   * @returns Market share analysis for each DEX
   */
  static async getDexMarketShare(blockNumber?: number): Promise<{
    [dex: string]: { share: string; volume: string }
  }> {
    const analytics = await this.getDexAnalytics(blockNumber);
    const marketShare: { [dex: string]: { share: string; volume: string } } = {};

    for (const [programId, metrics] of Object.entries(analytics.programs)) {
      marketShare[metrics.name] = {
        share: metrics.transactionShare,
        volume: metrics.valueChange
      };
    }

    return marketShare;
  }

  /**
   * Get DEX success rates
   * @param blockNumber Optional block number
   * @returns Success rates for each DEX
   */
  static async getDexSuccessRates(blockNumber?: number): Promise<{
    [dex: string]: { successRate: string; totalTx: number }
  }> {
    const analytics = await this.getDexAnalytics(blockNumber);
    const successRates: { [dex: string]: { successRate: string; totalTx: number } } = {};

    for (const [programId, metrics] of Object.entries(analytics.programs)) {
      successRates[metrics.name] = {
        successRate: metrics.successRate,
        totalTx: metrics.transactions
      };
    }

    return successRates;
  }

  /**
   * Get unique user counts for each DEX
   * @param blockNumber Optional block number
   * @returns User counts for each DEX
   */
  static async getDexUserCounts(blockNumber?: number): Promise<{
    [dex: string]: { users: number; avgTxPerUser: number }
  }> {
    const analytics = await this.getDexAnalytics(blockNumber);
    const userCounts: { [dex: string]: { users: number; avgTxPerUser: number } } = {};

    for (const [programId, metrics] of Object.entries(analytics.programs)) {
      userCounts[metrics.name] = {
        users: metrics.uniqueUserCount,
        avgTxPerUser: metrics.transactions / metrics.uniqueUserCount
      };
    }

    return userCounts;
  }

  /**
   * Calculate total DEX volume in SOL
   * @param blockNumber Optional block number
   * @returns Total volume in SOL
   */
  static async getTotalDexVolume(blockNumber?: number): Promise<string> {
    const analytics = await this.getDexAnalytics(blockNumber);
    return analytics.totalValueChange;
  }
}
