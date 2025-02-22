"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountMonitorService = void 0;
const web3_js_1 = require("@solana/web3.js");
const LAMPORTS_PER_SOL = 1000000000;
class AccountMonitorService {
    static lamportsToSolString(lamports, includeUnit = true) {
        const solAmount = lamports / LAMPORTS_PER_SOL;
        return `${solAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })} ${includeUnit ? 'SOL' : ''}`;
    }
    /**
     * Create a new account monitor instance
     * @param config Monitor configuration
     * @returns Cleanup function to remove the subscription
     */
    static async retryWithBackoff(fn, retries, delay, maxRetries) {
        try {
            return await fn();
        }
        catch (error) {
            if (retries >= maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retries)));
            return this.retryWithBackoff(fn, retries + 1, delay, maxRetries);
        }
    }
    static createMonitor(config) {
        const maxRetries = config.maxRetries || 5;
        const retryDelay = config.retryDelayMs || 1000;
        let isShuttingDown = false;
        const connection = new web3_js_1.Connection(config.rpcEndpoint, {
            commitment: config.commitment || 'confirmed',
            wsEndpoint: config.wsEndpoint
        });
        let subscriptionId = null;
        let lastLamports = null;
        let lastUpdateTime = 0;
        const updateInterval = config.updateIntervalMs || 0;
        const publicKey = new web3_js_1.PublicKey(config.accountAddress);
        const setupSubscription = async () => {
            try {
                const accountInfo = await connection.getAccountInfo(publicKey);
                if (accountInfo) {
                    lastLamports = accountInfo.lamports;
                }
                return connection.onAccountChange(publicKey, (accountInfo, context) => {
                    const currentTime = Date.now();
                    if (updateInterval > 0 && currentTime - lastUpdateTime < updateInterval) {
                        return;
                    }
                    const currentLamports = accountInfo.lamports;
                    const delta = lastLamports !== null ? currentLamports - lastLamports : 0;
                    if (config.onBalanceChange) {
                        config.onBalanceChange({
                            slot: context.slot,
                            balance: currentLamports,
                            delta,
                            formattedBalance: this.lamportsToSolString(currentLamports),
                            formattedDelta: this.lamportsToSolString(delta, false)
                        });
                    }
                    lastLamports = currentLamports;
                    lastUpdateTime = currentTime;
                }, config.commitment || 'confirmed');
            }
            catch (error) {
                if (config.onError) {
                    config.onError(error);
                }
                throw error;
            }
        };
        const setupWebSocket = async () => {
            var _a;
            try {
                subscriptionId = await this.retryWithBackoff(setupSubscription, 0, retryDelay, maxRetries);
                (_a = connection.onDisconnect) === null || _a === void 0 ? void 0 : _a.call(connection, () => {
                    if (!isShuttingDown && config.onError) {
                        config.onError(new Error('WebSocket disconnected'));
                    }
                    if (!isShuttingDown) {
                        setTimeout(async () => {
                            try {
                                if (subscriptionId !== null) {
                                    await connection.removeAccountChangeListener(subscriptionId);
                                }
                                await setupWebSocket();
                                if (config.onReconnect) {
                                    config.onReconnect();
                                }
                            }
                            catch (error) {
                                if (config.onError) {
                                    config.onError(error);
                                }
                            }
                        }, retryDelay);
                    }
                });
            }
            catch (error) {
                if (config.onError) {
                    config.onError(error);
                }
                throw error;
            }
        };
        setupWebSocket().catch(error => {
            if (config.onError) {
                config.onError(error);
            }
        });
        // Initial subscription setup
        const initialSubscription = async () => {
            try {
                const accountInfo = await connection.getAccountInfo(publicKey);
                if (accountInfo) {
                    lastLamports = accountInfo.lamports;
                }
                subscriptionId = connection.onAccountChange(publicKey, (accountInfo, context) => {
                    const currentLamports = accountInfo.lamports;
                    const delta = lastLamports !== null ? currentLamports - lastLamports : 0;
                    const now = Date.now();
                    // Only notify if enough time has passed since last update
                    if (now - lastUpdateTime >= updateInterval) {
                        if (config.onBalanceChange) {
                            config.onBalanceChange({
                                slot: context.slot,
                                balance: currentLamports,
                                delta,
                                formattedBalance: this.lamportsToSolString(currentLamports),
                                formattedDelta: this.lamportsToSolString(Math.abs(delta))
                            });
                        }
                        lastUpdateTime = now;
                    }
                    lastLamports = currentLamports;
                }, config.commitment || 'confirmed');
                return subscriptionId;
            }
            catch (error) {
                if (config.onError) {
                    config.onError(error);
                }
                throw error;
            }
        };
        // Start the initial subscription
        initialSubscription().catch(error => {
            if (config.onError) {
                config.onError(error);
            }
        });
        return () => {
            isShuttingDown = true;
            if (subscriptionId !== null) {
                connection.removeAccountChangeListener(subscriptionId)
                    .catch(error => console.error('Error removing account listener:', error));
            }
        };
    }
    /**
     * Monitor multiple accounts simultaneously
     * @param wsEndpoint WebSocket endpoint URL
     * @param accounts Map of account addresses to their callbacks
     * @param commitment Optional commitment level
     * @returns Cleanup function to remove all subscriptions
     */
    static createMultiMonitor(rpcEndpoint, wsEndpoint, accounts, commitment = 'confirmed') {
        const cleanupFunctions = [];
        for (const [accountAddress, callback] of accounts.entries()) {
            const cleanup = this.createMonitor({
                rpcEndpoint,
                wsEndpoint,
                accountAddress,
                onBalanceChange: callback,
                commitment
            });
            cleanupFunctions.push(cleanup);
        }
        return () => {
            cleanupFunctions.forEach(cleanup => cleanup());
        };
    }
}
exports.AccountMonitorService = AccountMonitorService;
//# sourceMappingURL=AccountMonitorService.js.map