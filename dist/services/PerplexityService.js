"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.perplexity = exports.PerplexityService = void 0;
const DatabaseService_1 = require("./DatabaseService");
/**
 * Service for managing Perplexity AI interactions
 */
class PerplexityService {
    constructor() {
        this.initializeDatabase();
    }
    /**
     * Get singleton instance of PerplexityService
     */
    static getInstance() {
        if (!PerplexityService.instance) {
            PerplexityService.instance = new PerplexityService();
        }
        return PerplexityService.instance;
    }
    /**
     * Initialize database tables
     */
    async initializeDatabase() {
        try {
            await DatabaseService_1.db.query(`
        CREATE TABLE IF NOT EXISTS perplexity_queries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          query TEXT NOT NULL,
          response TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          token_count INTEGER NOT NULL,
          user_id UUID
        );
      `);
        }
        catch (error) {
            console.error('Failed to initialize Perplexity database:', error);
        }
    }
    /**
     * Save a query and its response
     */
    async saveQuery(query, response, tokenCount, userId) {
        const result = await DatabaseService_1.db.query(`INSERT INTO perplexity_queries (query, response, token_count, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, query, response, tokenCount, userId);
        return result[0];
    }
    /**
     * Get query history for a user
     */
    async getQueryHistory(userId, limit = 10) {
        const result = await DatabaseService_1.db.query(`SELECT * FROM perplexity_queries
       WHERE user_id = $1 OR $1 IS NULL
       ORDER BY created_at DESC
       LIMIT $2`, userId, limit);
        return result;
    }
    /**
     * Get similar queries
     */
    async getSimilarQueries(query, limit = 5) {
        const result = await DatabaseService_1.db.query(`SELECT *,
              similarity(query, $1) as sim_score
       FROM perplexity_queries
       WHERE similarity(query, $1) > 0.3
       ORDER BY sim_score DESC
       LIMIT $2`, query, limit);
        return result;
    }
    /**
     * Delete old queries
     */
    async cleanupOldQueries(daysOld = 30) {
        var _a;
        const result = await DatabaseService_1.db.query(`DELETE FROM perplexity_queries
       WHERE created_at < NOW() - INTERVAL '$1 days'
       RETURNING COUNT(*)`, daysOld);
        return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
    }
}
exports.PerplexityService = PerplexityService;
// Export singleton instance
exports.perplexity = PerplexityService.getInstance();
//# sourceMappingURL=PerplexityService.js.map