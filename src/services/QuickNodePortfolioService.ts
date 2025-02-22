import axios from 'axios';

const QUICKNODE_API_KEY = process.env.QUICK_NODE_API_KEY;
const QUICKNODE_URL = process.env.QUICK_NODE_URL;

if (!QUICKNODE_API_KEY || !QUICKNODE_URL) {
  console.error('QuickNode configuration missing. Please check your .env file');
}

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

export class QuickNodePortfolioService {
  private static async makeRequest(userData: any): Promise<PortfolioResponse> {
    try {
      const response = await axios.post(
        `${QUICKNODE_URL}?result_only=true`,
        { user_data: userData },
        {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': QUICKNODE_API_KEY!
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('QuickNode Portfolio API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message);
    }
  }

  /**
   * Create a new portfolio
   * @param portfolioName Name of the portfolio to create
   */
  static async createPortfolio(portfolioName: string): Promise<PortfolioResponse> {
    return this.makeRequest({
      instruction: 'createPortfolio',
      portfolioName
    });
  }

  /**
   * Update an existing portfolio
   * @param portfolioName Name of the portfolio to update
   * @param addAddresses Optional array of addresses to add
   * @param removeAddresses Optional array of addresses to remove
   */
  static async updatePortfolio(
    portfolioName: string,
    addAddresses?: string[],
    removeAddresses?: string[]
  ): Promise<PortfolioResponse> {
    return this.makeRequest({
      instruction: 'updatePortfolio',
      portfolioName,
      addAddresses,
      removeAddresses
    });
  }

  /**
   * Get portfolio details
   * @param portfolioName Name of the portfolio to retrieve
   */
  static async getPortfolio(portfolioName: string): Promise<PortfolioResponse> {
    return this.makeRequest({
      instruction: 'getPortfolio',
      portfolioName
    });
  }

  /**
   * Get portfolio balances
   * @param portfolioName Name of the portfolio to get balances for
   */
  static async getPortfolioBalances(portfolioName: string): Promise<PortfolioResponse> {
    return this.makeRequest({
      instruction: 'getPortfolioBalances',
      portfolioName
    });
  }

  /**
   * Add addresses to a portfolio
   * @param portfolioName Name of the portfolio
   * @param addresses Array of addresses to add
   */
  static async addAddressesToPortfolio(
    portfolioName: string,
    addresses: string[]
  ): Promise<PortfolioResponse> {
    return this.updatePortfolio(portfolioName, addresses, []);
  }

  /**
   * Remove addresses from a portfolio
   * @param portfolioName Name of the portfolio
   * @param addresses Array of addresses to remove
   */
  static async removeAddressesFromPortfolio(
    portfolioName: string,
    addresses: string[]
  ): Promise<PortfolioResponse> {
    return this.updatePortfolio(portfolioName, [], addresses);
  }
}
