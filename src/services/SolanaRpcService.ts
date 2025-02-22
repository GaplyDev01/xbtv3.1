import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const QUICKNODE_RPC_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL;

if (!QUICKNODE_RPC_URL) {
  console.warn('NEXT_PUBLIC_QUICKNODE_RPC_URL not set, falling back to public RPC');
}

interface ConnectionConfig {
  commitment?: 'processed' | 'confirmed' | 'finalized';
  wsEndpoint?: string;
  confirmTransactionInitialTimeout?: number;
}

export class SolanaRpcService {
  private static connection: Connection | null = null;
  private static wsConnection: Connection | null = null;

  /**
   * Get a Solana RPC connection instance
   * @param config Optional connection configuration
   * @returns Connection instance
   */
  static getConnection(config: ConnectionConfig = {}): Connection {
    if (!this.connection) {
      const endpoint = QUICKNODE_RPC_URL || clusterApiUrl('mainnet-beta');
      this.connection = new Connection(endpoint, {
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
  static getWsConnection(config: ConnectionConfig = {}): Connection {
    if (!this.wsConnection && config.wsEndpoint) {
      this.wsConnection = new Connection(config.wsEndpoint, {
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
  static async getAccountInfo(publicKey: string | PublicKey) {
    try {
      const key = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const connection = this.getConnection();
      const accountInfo = await connection.getAccountInfo(key);
      return accountInfo;
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  /**
   * Get token balances for a given public key
   * @param publicKey Account public key
   * @returns Token balances
   */
  static async getTokenBalances(publicKey: string | PublicKey) {
    try {
      const key = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const connection = this.getConnection();
      const balances = await connection.getTokenAccountsByOwner(key, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });
      return balances;
    } catch (error) {
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
  static subscribeToAccountChanges(
    publicKey: string | PublicKey,
    callback: (accountInfo: any) => void
  ): number {
    try {
      const key = typeof publicKey === 'string' ? new PublicKey(publicKey) : publicKey;
      const connection = this.getWsConnection();
      return connection.onAccountChange(key, callback);
    } catch (error) {
      console.error('Error subscribing to account changes:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from account changes
   * @param subscriptionId Subscription ID to unsubscribe
   */
  static async unsubscribe(subscriptionId: number): Promise<void> {
    try {
      const connection = this.getWsConnection();
      await connection.removeAccountChangeListener(subscriptionId);
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }
}
