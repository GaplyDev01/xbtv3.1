import axios from 'axios';
import { PublicKey } from '@solana/web3.js';

const QUICKNODE_API_KEY = process.env.QUICK_NODE_API_KEY;
const QUICKNODE_URL = process.env.QUICK_NODE_URL;

if (!QUICKNODE_API_KEY || !QUICKNODE_URL) {
  console.error('QuickNode configuration missing. Please check your .env file');
}

export interface TokenAsset {
  tokenAddress: string;
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
}

export interface TokenResponse {
  owner: string;
  assets: TokenAsset[];
  totalPages: number;
  pageNumber: number;
  totalItems: number;
}

export interface TokenQueryParams {
  wallet: string;
  page?: number;
  perPage?: number;
  omitFields?: string[];
}

export class SplTokenService {
  /**
   * Validates a Solana address
   * @param address The address to validate
   * @returns boolean indicating if address is valid
   */
  static isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch SPL tokens for a wallet
   * @param params Query parameters for token fetch
   * @returns TokenResponse containing token data
   */
  static async fetchTokens(params: TokenQueryParams): Promise<TokenResponse> {
    if (!this.isValidSolanaAddress(params.wallet)) {
      throw new Error('Invalid Solana wallet address');
    }

    try {
      const response = await axios.post(
        `${QUICKNODE_URL}?result_only=true`,
        {
          user_data: {
            wallet: params.wallet,
            page: params.page || 1,
            perPage: params.perPage || 20,
            omitFields: params.omitFields?.join(',')
          }
        },
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': QUICKNODE_API_KEY!
          }
        }
      );

      const result = response.data?.body?.result;
      if (!result) {
        throw new Error('Invalid response format from QuickNode');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching SPL tokens:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  /**
   * Get token balances for multiple wallets
   * @param wallets Array of wallet addresses
   * @returns Map of wallet addresses to their token balances
   */
  static async getMultipleWalletTokens(wallets: string[]): Promise<Map<string, TokenAsset[]>> {
    const validWallets = wallets.filter(wallet => this.isValidSolanaAddress(wallet));
    if (validWallets.length === 0) {
      throw new Error('No valid wallet addresses provided');
    }

    const results = new Map<string, TokenAsset[]>();
    await Promise.all(
      validWallets.map(async (wallet) => {
        try {
          const response = await this.fetchTokens({ wallet });
          results.set(wallet, response.assets);
        } catch (error) {
          console.error(`Error fetching tokens for wallet ${wallet}:`, error);
          results.set(wallet, []);
        }
      })
    );

    return results;
  }

  /**
   * Get specific token balance for a wallet
   * @param wallet Wallet address
   * @param tokenAddress SPL token address
   * @returns TokenAsset if found, null otherwise
   */
  static async getSpecificTokenBalance(
    wallet: string,
    tokenAddress: string
  ): Promise<TokenAsset | null> {
    if (!this.isValidSolanaAddress(wallet) || !this.isValidSolanaAddress(tokenAddress)) {
      throw new Error('Invalid wallet or token address');
    }

    try {
      const response = await this.fetchTokens({ wallet });
      return response.assets.find(asset => asset.tokenAddress === tokenAddress) || null;
    } catch (error) {
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
  static async calculateWalletValue(wallet: string): Promise<number> {
    try {
      const response = await this.fetchTokens({ wallet });
      const usdtToken = response.assets.find(
        asset => asset.symbol === 'USDT' || asset.symbol === 'USDC'
      );
      
      if (!usdtToken) {
        return 0;
      }

      return parseFloat(usdtToken.balance);
    } catch (error) {
      console.error('Error calculating wallet value:', error);
      return 0;
    }
  }
}
