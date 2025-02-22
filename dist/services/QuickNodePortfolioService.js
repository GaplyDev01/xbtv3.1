"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickNodePortfolioService = void 0;
const axios_1 = __importDefault(require("axios"));
const QUICKNODE_API_KEY = process.env.QUICK_NODE_API_KEY;
const QUICKNODE_URL = process.env.QUICK_NODE_URL;
if (!QUICKNODE_API_KEY || !QUICKNODE_URL) {
    console.error('QuickNode configuration missing. Please check your .env file');
}
class QuickNodePortfolioService {
    static async makeRequest(userData) {
        var _a, _b, _c;
        try {
            const response = await axios_1.default.post(`${QUICKNODE_URL}?result_only=true`, { user_data: userData }, {
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': QUICKNODE_API_KEY
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('QuickNode Portfolio API Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) || error.message);
        }
    }
    /**
     * Create a new portfolio
     * @param portfolioName Name of the portfolio to create
     */
    static async createPortfolio(portfolioName) {
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
    static async updatePortfolio(portfolioName, addAddresses, removeAddresses) {
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
    static async getPortfolio(portfolioName) {
        return this.makeRequest({
            instruction: 'getPortfolio',
            portfolioName
        });
    }
    /**
     * Get portfolio balances
     * @param portfolioName Name of the portfolio to get balances for
     */
    static async getPortfolioBalances(portfolioName) {
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
    static async addAddressesToPortfolio(portfolioName, addresses) {
        return this.updatePortfolio(portfolioName, addresses, []);
    }
    /**
     * Remove addresses from a portfolio
     * @param portfolioName Name of the portfolio
     * @param addresses Array of addresses to remove
     */
    static async removeAddressesFromPortfolio(portfolioName, addresses) {
        return this.updatePortfolio(portfolioName, [], addresses);
    }
}
exports.QuickNodePortfolioService = QuickNodePortfolioService;
//# sourceMappingURL=QuickNodePortfolioService.js.map