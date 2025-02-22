"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolanaRpcService = void 0;
const web3_js_1 = require("@solana/web3.js");
const QUICKNODE_RPC_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;
if (!QUICKNODE_RPC_URL) {
    console.warn('NEXT_PUBLIC_QUICKNODE_RPC_URL not set, falling back to public RPC');
}
class SolanaRpcService {
    /**
     * Get a Solana RPC connection instance
     * @param config Optional connection configuration
     * @returns Connection instance
     */
    static getConnection(config = {}) {
        if (!this.connection) {
            const endpoint = QUICKNODE_RPC_URL || (0, web3_js_1.clusterApiUrl)('mainnet-beta');
            this.connection = new web3_js_1.Connection(endpoint, {
                commitment: config.commitment || 'confirmed',
                confirmTransactionInitialTimeout: config.confirmTransactionInitialTimeout || 60000,
            });
        }
        return this.connection;
    }
    /**
     * Get a WebSocket connection instance
     * @param config Optional connection configuration
     * @returns WebSocket Connection instance
     */
    static getWsConnection(config = {}) {
        if (!this.wsConnection && config.wsEndpoint) {
            this.wsConnection = new web3_js_1.Connection(config.wsEndpoint, {
                commitment: config.commitment || 'confirmed',
                wsEndpoint: config.wsEndpoint,
            });
        }
        return this.wsConnection || this.getConnection(config);
    }
    /**
     * Get account info for a given public key
     * @param publicKey Account public key
     * @returns Account info
     */
    static async getAccountInfo(publicKey) {
        try {
            const key = typeof publicKey === 'string' ? new web3_js_1.PublicKey(publicKey) : publicKey;
            const connection = this.getConnection();
            const accountInfo = await connection.getAccountInfo(key);
            return accountInfo;
        }
        catch (error) {
            console.error('Error fetching account info:', error);
            throw error;
        }
    }
    /**
     * Get token balances for a given public key
     * @param publicKey Account public key
     * @returns Token balances
     */
    static async getTokenBalances(publicKey) {
        try {
            const key = typeof publicKey === 'string' ? new web3_js_1.PublicKey(publicKey) : publicKey;
            const connection = this.getConnection();
            const balances = await connection.getTokenAccountsByOwner(key, {
                programId: new web3_js_1.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            });
            return balances;
        }
        catch (error) {
            console.error('Error fetching token balances:', error);
            throw error;
        }
    }
    /**
     * Subscribe to account changes
     * @param publicKey Account public key
     * @param callback Callback function to handle updates
     * @returns Subscription id
     */
    static subscribeToAccountChanges(publicKey, callback) {
        try {
            const key = typeof publicKey === 'string' ? new web3_js_1.PublicKey(publicKey) : publicKey;
            const connection = this.getWsConnection();
            return connection.onAccountChange(key, callback);
        }
        catch (error) {
            console.error('Error subscribing to account changes:', error);
            throw error;
        }
    }
    /**
     * Unsubscribe from account changes
     * @param subscriptionId Subscription ID to unsubscribe
     */
    static async unsubscribe(subscriptionId) {
        try {
            const connection = this.getWsConnection();
            await connection.removeAccountChangeListener(subscriptionId);
        }
        catch (error) {
            console.error('Error unsubscribing:', error);
            throw error;
        }
    }
}
exports.SolanaRpcService = SolanaRpcService;
SolanaRpcService.connection = null;
SolanaRpcService.wsConnection = null;
//# sourceMappingURL=SolanaRpcService.js.map