import { Connection, PublicKey } from '@solana/web3.js';
interface ConnectionConfig {
    commitment?: 'processed' | 'confirmed' | 'finalized';
    wsEndpoint?: string;
    confirmTransactionInitialTimeout?: number;
}
export declare class SolanaRpcService {
    private static connection;
    private static wsConnection;
    /**
     * Get a Solana RPC connection instance
     * @param config Optional connection configuration
     * @returns Connection instance
     */
    static getConnection(config?: ConnectionConfig): Connection;
    /**
     * Get a WebSocket connection instance
     * @param config Optional connection configuration
     * @returns WebSocket Connection instance
     */
    static getWsConnection(config?: ConnectionConfig): Connection;
    /**
     * Get account info for a given public key
     * @param publicKey Account public key
     * @returns Account info
     */
    static getAccountInfo(publicKey: string | PublicKey): Promise<import("@solana/web3.js").AccountInfo<Buffer<ArrayBufferLike>> | null>;
    /**
     * Get token balances for a given public key
     * @param publicKey Account public key
     * @returns Token balances
     */
    static getTokenBalances(publicKey: string | PublicKey): Promise<import("@solana/web3.js").RpcResponseAndContext<import("@solana/web3.js").GetProgramAccountsResponse>>;
    /**
     * Subscribe to account changes
     * @param publicKey Account public key
     * @param callback Callback function to handle updates
     * @returns Subscription id
     */
    static subscribeToAccountChanges(publicKey: string | PublicKey, callback: (accountInfo: any) => void): number;
    /**
     * Unsubscribe from account changes
     * @param subscriptionId Subscription ID to unsubscribe
     */
    static unsubscribe(subscriptionId: number): Promise<void>;
}
export {};
