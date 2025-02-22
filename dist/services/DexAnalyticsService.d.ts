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
export declare const DEX_PROGRAMS: {
    readonly PHOENIX: "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY";
    readonly RAYDIUM_CLM: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
    readonly JUPITER: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";
};
export declare class DexAnalyticsService {
    /**
     * Get DEX analytics for a specific block
     * @param blockNumber Optional block number, defaults to latest
     * @returns DexAnalytics data
     */
    static getDexAnalytics(blockNumber?: number): Promise<DexAnalytics>;
    /**
     * Get historical DEX analytics
     * @param startBlock Starting block number
     * @param endBlock Ending block number
     * @param interval Number of blocks between each data point
     * @returns Array of DexAnalytics data points
     */
    static getHistoricalDexAnalytics(startBlock: number, endBlock: number, interval?: number): Promise<DexAnalytics[]>;
    /**
     * Get DEX market share analysis
     * @param blockNumber Optional block number
     * @returns Market share analysis for each DEX
     */
    static getDexMarketShare(blockNumber?: number): Promise<{
        [dex: string]: {
            share: string;
            volume: string;
        };
    }>;
    /**
     * Get DEX success rates
     * @param blockNumber Optional block number
     * @returns Success rates for each DEX
     */
    static getDexSuccessRates(blockNumber?: number): Promise<{
        [dex: string]: {
            successRate: string;
            totalTx: number;
        };
    }>;
    /**
     * Get unique user counts for each DEX
     * @param blockNumber Optional block number
     * @returns User counts for each DEX
     */
    static getDexUserCounts(blockNumber?: number): Promise<{
        [dex: string]: {
            users: number;
            avgTxPerUser: number;
        };
    }>;
    /**
     * Calculate total DEX volume in SOL
     * @param blockNumber Optional block number
     * @returns Total volume in SOL
     */
    static getTotalDexVolume(blockNumber?: number): Promise<string>;
}
