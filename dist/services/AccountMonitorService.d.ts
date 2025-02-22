interface AccountChangeData {
    slot: number;
    balance: number;
    delta: number;
    formattedBalance: string;
    formattedDelta: string;
}
interface AccountMonitorConfig {
    rpcEndpoint: string;
    wsEndpoint: string;
    accountAddress: string;
    onBalanceChange?: (data: AccountChangeData) => void;
    onError?: (error: Error) => void;
    onReconnect?: () => void;
    commitment?: 'processed' | 'confirmed' | 'finalized';
    updateIntervalMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
}
export declare class AccountMonitorService {
    private static lamportsToSolString;
    /**
     * Create a new account monitor instance
     * @param config Monitor configuration
     * @returns Cleanup function to remove the subscription
     */
    private static retryWithBackoff;
    static createMonitor(config: AccountMonitorConfig): () => void;
    /**
     * Monitor multiple accounts simultaneously
     * @param wsEndpoint WebSocket endpoint URL
     * @param accounts Map of account addresses to their callbacks
     * @param commitment Optional commitment level
     * @returns Cleanup function to remove all subscriptions
     */
    static createMultiMonitor(rpcEndpoint: string, wsEndpoint: string, accounts: Map<string, (data: AccountChangeData) => void>, commitment?: 'processed' | 'confirmed' | 'finalized'): () => void;
}
export {};
