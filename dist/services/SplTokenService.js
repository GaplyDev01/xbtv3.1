"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplTokenService = void 0;
const axios_1 = __importDefault(require("axios"));
const web3_js_1 = require("@solana/web3.js");
const QUICKNODE_API_KEY = process.env.QUICK_NODE_API_KEY;
const QUICKNODE_URL = process.env.QUICK_NODE_URL;
if (!QUICKNODE_API_KEY || !QUICKNODE_URL) {
    console.error('QuickNode configuration missing. Please check your .env file');
}
class SplTokenService {
    /**
     * Validates a Solana address
     * @param address The address to validate
     * @returns boolean indicating if address is valid
     */
    static isValidSolanaAddress(address) {
        try {
            new web3_js_1.PublicKey(address);
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    /**
     * Fetch SPL tokens for a wallet
     * @param params Query parameters for token fetch
     * @returns TokenResponse containing token data
     */
    static async fetchTokens(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!this.isValidSolanaAddress(params.wallet)) {
            throw new Error('Invalid Solana wallet address');
        }
        try {
            const response = await axios_1.default.post(`${QUICKNODE_URL}?result_only=true`, {
                user_data: {
                    wallet: params.wallet,
                    page: params.page || 1,
                    perPage: params.perPage || 20,
                    omitFields: (_a = params.omitFields) === null || _a === void 0 ? void 0 : _a.join(',')
                }
            }, {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': QUICKNODE_API_KEY
                }
            });
            const result = (_c = (_b = response.data) === null || _b === void 0 ? void 0 : _b.body) === null || _c === void 0 ? void 0 : _c.result;
            if (!result) {
                throw new Error('Invalid response format from QuickNode');
            }
            return result;
        }
        catch (error) {
            console.error('Error fetching SPL tokens:', ((_d = error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message);
            throw new Error(((_g = (_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.message) || error.message);
        }
    }
    /**
     * Get token balances for multiple wallets
     * @param wallets Array of wallet addresses
     * @returns Map of wallet addresses to their token balances
     */
    static async getMultipleWalletTokens(wallets) {
        const validWallets = wallets.filter(wallet => this.isValidSolanaAddress(wallet));
        if (validWallets.length === 0) {
            throw new Error('No valid wallet addresses provided');
        }
        const results = new Map();
        await Promise.all(validWallets.map(async (wallet) => {
            try {
                const response = await this.fetchTokens({ wallet });
                results.set(wallet, response.assets);
            }
            catch (error) {
                console.error(`Error fetching tokens for wallet ${wallet}:`, error);
                results.set(wallet, []);
            }
        }));
        return results;
    }
    /**
     * Get specific token balance for a wallet
     * @param wallet Wallet address
     * @param tokenAddress SPL token address
     * @returns TokenAsset if found, null otherwise
     */
    static async getSpecificTokenBalance(wallet, tokenAddress) {
        if (!this.isValidSolanaAddress(wallet) || !this.isValidSolanaAddress(tokenAddress)) {
            throw new Error('Invalid wallet or token address');
        }
        try {
            const response = await this.fetchTokens({ wallet });
            return response.assets.find(asset => asset.tokenAddress === tokenAddress) || null;
        }
        catch (error) {
            console.error('Error fetching specific token balance:', error);
            throw error;
        }
    }
    /**
     * Calculate total value in USDT for a wallet's tokens
     * Requires token prices to be available
     * @param wallet Wallet address
     * @returns Total value in USDT
     */
    static async calculateWalletValue(wallet) {
        try {
            const response = await this.fetchTokens({ wallet });
            const usdtToken = response.assets.find(asset => asset.symbol === 'USDT' || asset.symbol === 'USDC');
            if (!usdtToken) {
                return 0;
            }
            return parseFloat(usdtToken.balance);
        }
        catch (error) {
            console.error('Error calculating wallet value:', error);
            return 0;
        }
    }
}
exports.SplTokenService = SplTokenService;
//# sourceMappingURL=SplTokenService.js.map