import { db } from './DatabaseService';

export interface PerplexityQuery {
  id: string;
  query: string;
  response: string;
  created_at: Date;
  token_count: number;
  user_id?: string;
}

/**
 * Service for managing Perplexity AI interactions
 */
export class PerplexityService {
  private static instance: PerplexityService;

  private constructor() {
    this.initializeDatabase();
  }

  /**
   * Get singleton instance of PerplexityService
   */
  public static getInstance(): PerplexityService {
    if (!PerplexityService.instance) {
      PerplexityService.instance = new PerplexityService();
    }
    return PerplexityService.instance;
  }

  /**
   * Initialize database tables
   */
  private async initializeDatabase() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS perplexity_queries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          query TEXT NOT NULL,
          response TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          token_count INTEGER NOT NULL,
          user_id UUID
        );
      `);
    } catch (error) {
      console.error('Failed to initialize Perplexity database:', error);
    }
  }

  /**
   * Save a query and its response
   */
  public async saveQuery(
    query: string,
    response: string,
    tokenCount: number,
    userId?: string
  ): Promise<PerplexityQuery> {
    const result = await db.query<PerplexityQuery>(
      `INSERT INTO perplexity_queries (query, response, token_count, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      query,
      response,
      tokenCount,
      userId
    );
    return result[0];
  }

  /**
   * Get query history for a user
   */
  public async getQueryHistory(userId?: string, limit = 10): Promise<PerplexityQuery[]> {
    const result = await db.query<PerplexityQuery>(
      `SELECT * FROM perplexity_queries
       WHERE user_id = $1 OR $1 IS NULL
       ORDER BY created_at DESC
       LIMIT $2`,
      userId,
      limit
    );
    return result;
  }

  /**
   * Get similar queries
   */
  public async getSimilarQueries(query: string, limit = 5): Promise<PerplexityQuery[]> {
    const result = await db.query<PerplexityQuery>(
      `SELECT *,
              similarity(query, $1) as sim_score
       FROM perplexity_queries
       WHERE similarity(query, $1) > 0.3
       ORDER BY sim_score DESC
       LIMIT $2`,
      query,
      limit
    );
    return result;
  }

  /**
   * Delete old queries
   */
  public async cleanupOldQueries(daysOld = 30): Promise<number> {
    const result = await db.query<{ count: number }>(
      `DELETE FROM perplexity_queries
       WHERE created_at < NOW() - INTERVAL '$1 days'
       RETURNING COUNT(*)`,
      daysOld
    );
    return result[0]?.count || 0;
  }
}

// Export singleton instance
export const perplexity = PerplexityService.getInstance();
