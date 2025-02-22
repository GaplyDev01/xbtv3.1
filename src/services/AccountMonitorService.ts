import { Connection, PublicKey } from '@solana/web3.js';

const LAMPORTS_PER_SOL = 1_000_000_000;

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

interface WebSocketConnection extends Connection {
  onDisconnect?: (callback: () => void) => void;
}

export class AccountMonitorService {
  private static lamportsToSolString(lamports: number, includeUnit = true): string {
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
  private static async retryWithBackoff(
    fn: () => Promise<any>,
    retries: number,
    delay: number,
    maxRetries: number
  ): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retries)));
      return this.retryWithBackoff(fn, retries + 1, delay, maxRetries);
    }
  }

  static createMonitor(config: AccountMonitorConfig): () => void {
    const maxRetries = config.maxRetries || 5;
    const retryDelay = config.retryDelayMs || 1000;
    let isShuttingDown = false;

    const connection = new Connection(config.rpcEndpoint, {
      commitment: config.commitment || 'confirmed',
      wsEndpoint: config.wsEndpoint
    }) as WebSocketConnection;
    
    let subscriptionId: number | null = null;
    let lastLamports: number | null = null;
    let lastUpdateTime = 0;
    const updateInterval = config.updateIntervalMs || 0;
    const publicKey = new PublicKey(config.accountAddress);

    const setupSubscription = async () => {
      try {
        const accountInfo = await connection.getAccountInfo(publicKey);
        if (accountInfo) {
          lastLamports = accountInfo.lamports;
        }

        return connection.onAccountChange(
          publicKey,
          (accountInfo, context) => {
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
          },
          config.commitment || 'confirmed'
        );
      } catch (error) {
        if (config.onError) {
          config.onError(error as Error);
        }
        throw error;
      }
    };

    const setupWebSocket = async () => {
      try {
        subscriptionId = await this.retryWithBackoff(
          setupSubscription,
          0,
          retryDelay,
          maxRetries
        );

        connection.onDisconnect?.(() => {
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
              } catch (error) {
                if (config.onError) {
                  config.onError(error as Error);
                }
              }
            }, retryDelay);
          }
        });
      } catch (error) {
        if (config.onError) {
          config.onError(error as Error);
        }
        throw error;
      }
    };

    setupWebSocket().catch(error => {
      if (config.onError) {
        config.onError(error as Error);
      }
    });

    // Initial subscription setup
    const initialSubscription = async () => {
      try {
        const accountInfo = await connection.getAccountInfo(publicKey);
        if (accountInfo) {
          lastLamports = accountInfo.lamports;
        }

        subscriptionId = connection.onAccountChange(
          publicKey,
          (accountInfo, context) => {
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
          },
          config.commitment || 'confirmed'
        );

        return subscriptionId;
      } catch (error) {
        if (config.onError) {
          config.onError(error as Error);
        }
        throw error;
      }
    };

    // Start the initial subscription
    initialSubscription().catch(error => {
      if (config.onError) {
        config.onError(error as Error);
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
  static createMultiMonitor(
    rpcEndpoint: string,
    wsEndpoint: string,
    accounts: Map<string, (data: AccountChangeData) => void>,
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
  ): () => void {
    const cleanupFunctions: (() => void)[] = [];

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
