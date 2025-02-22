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
export declare class PerplexityService {
    private static instance;
    private constructor();
    /**
     * Get singleton instance of PerplexityService
     */
    static getInstance(): PerplexityService;
    /**
     * Initialize database tables
     */
    private initializeDatabase;
    /**
     * Save a query and its response
     */
    saveQuery(query: string, response: string, tokenCount: number, userId?: string): Promise<PerplexityQuery>;
    /**
     * Get query history for a user
     */
    getQueryHistory(userId?: string, limit?: number): Promise<PerplexityQuery[]>;
    /**
     * Get similar queries
     */
    getSimilarQueries(query: string, limit?: number): Promise<PerplexityQuery[]>;
    /**
     * Delete old queries
     */
    cleanupOldQueries(daysOld?: number): Promise<number>;
}
export declare const perplexity: PerplexityService;
