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
export declare class SplTokenService {
    /**
     * Validates a Solana address
     * @param address The address to validate
     * @returns boolean indicating if address is valid
     */
    static isValidSolanaAddress(address: string): boolean;
    /**
     * Fetch SPL tokens for a wallet
     * @param params Query parameters for token fetch
     * @returns TokenResponse containing token data
     */
    static fetchTokens(params: TokenQueryParams): Promise<TokenResponse>;
    /**
     * Get token balances for multiple wallets
     * @param wallets Array of wallet addresses
     * @returns Map of wallet addresses to their token balances
     */
    static getMultipleWalletTokens(wallets: string[]): Promise<Map<string, TokenAsset[]>>;
    /**
     * Get specific token balance for a wallet
     * @param wallet Wallet address
     * @param tokenAddress SPL token address
     * @returns TokenAsset if found, null otherwise
     */
    static getSpecificTokenBalance(wallet: string, tokenAddress: string): Promise<TokenAsset | null>;
    /**
     * Calculate total value in USDT for a wallet's tokens
     * Requires token prices to be available
     * @param wallet Wallet address
     * @returns Total value in USDT
     */
    static calculateWalletValue(wallet: string): Promise<number>;
}
