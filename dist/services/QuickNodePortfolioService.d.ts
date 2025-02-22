interface PortfolioBalance {
    address: string;
    balance: number;
}
interface PortfolioResponse {
    message: string;
    portfolioName: string;
    addresses?: string[];
    balances?: PortfolioBalance[];
    error?: string;
}
export declare class QuickNodePortfolioService {
    private static makeRequest;
    /**
     * Create a new portfolio
     * @param portfolioName Name of the portfolio to create
     */
    static createPortfolio(portfolioName: string): Promise<PortfolioResponse>;
    /**
     * Update an existing portfolio
     * @param portfolioName Name of the portfolio to update
     * @param addAddresses Optional array of addresses to add
     * @param removeAddresses Optional array of addresses to remove
     */
    static updatePortfolio(portfolioName: string, addAddresses?: string[], removeAddresses?: string[]): Promise<PortfolioResponse>;
    /**
     * Get portfolio details
     * @param portfolioName Name of the portfolio to retrieve
     */
    static getPortfolio(portfolioName: string): Promise<PortfolioResponse>;
    /**
     * Get portfolio balances
     * @param portfolioName Name of the portfolio to get balances for
     */
    static getPortfolioBalances(portfolioName: string): Promise<PortfolioResponse>;
    /**
     * Add addresses to a portfolio
     * @param portfolioName Name of the portfolio
     * @param addresses Array of addresses to add
     */
    static addAddressesToPortfolio(portfolioName: string, addresses: string[]): Promise<PortfolioResponse>;
    /**
     * Remove addresses from a portfolio
     * @param portfolioName Name of the portfolio
     * @param addresses Array of addresses to remove
     */
    static removeAddressesFromPortfolio(portfolioName: string, addresses: string[]): Promise<PortfolioResponse>;
}
export {};
