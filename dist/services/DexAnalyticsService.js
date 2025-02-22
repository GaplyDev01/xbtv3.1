"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexAnalyticsService = exports.DEX_PROGRAMS = void 0;
const axios_1 = __importDefault(require("axios"));
const QUICKNODE_API_KEY = process.env.QUICK_NODE_API_KEY;
const QUICKNODE_URL = process.env.QUICK_NODE_URL;
if (!QUICKNODE_API_KEY || !QUICKNODE_URL) {
    console.error('QuickNode configuration missing. Please check your .env file');
}
exports.DEX_PROGRAMS = {
    PHOENIX: 'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY',
    RAYDIUM_CLM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    JUPITER: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
};
class DexAnalyticsService {
    /**
     * Get DEX analytics for a specific block
     * @param blockNumber Optional block number, defaults to latest
     * @returns DexAnalytics data
     */
    static async getDexAnalytics(blockNumber) {
        var _a, _b, _c, _d;
        try {
            const response = await axios_1.default.post(`${QUICKNODE_URL}?result_only=true`, {
                network: 'solana-mainnet',
                dataset: 'programs_with_logs',
                ...(blockNumber && { block_number: blockNumber })
            }, {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': QUICKNODE_API_KEY
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching DEX analytics:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(((_d = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || error.message);
        }
    }
    /**
     * Get historical DEX analytics
     * @param startBlock Starting block number
     * @param endBlock Ending block number
     * @param interval Number of blocks between each data point
     * @returns Array of DexAnalytics data points
     */
    static async getHistoricalDexAnalytics(startBlock, endBlock, interval = 1000) {
        const blocks = [];
        for (let block = startBlock; block <= endBlock; block += interval) {
            blocks.push(block);
        }
        const analytics = await Promise.all(blocks.map(block => this.getDexAnalytics(block)));
        return analytics;
    }
    /**
     * Get DEX market share analysis
     * @param blockNumber Optional block number
     * @returns Market share analysis for each DEX
     */
    static async getDexMarketShare(blockNumber) {
        const analytics = await this.getDexAnalytics(blockNumber);
        const marketShare = {};
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
    static async getDexSuccessRates(blockNumber) {
        const analytics = await this.getDexAnalytics(blockNumber);
        const successRates = {};
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
    static async getDexUserCounts(blockNumber) {
        const analytics = await this.getDexAnalytics(blockNumber);
        const userCounts = {};
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
    static async getTotalDexVolume(blockNumber) {
        const analytics = await this.getDexAnalytics(blockNumber);
        return analytics.totalValueChange;
    }
}
exports.DexAnalyticsService = DexAnalyticsService;
//# sourceMappingURL=DexAnalyticsService.js.map