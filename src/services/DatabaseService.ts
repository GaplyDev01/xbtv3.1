import postgres from 'postgres';

/**
 * Database configuration and connection service
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private sql: postgres.Sql;

  private constructor() {
    this.sql = postgres(process.env.DATABASE_URL!, {
      ssl: 'verify-full',
      max: 10, // Maximum number of connections
      idle_timeout: 20, // Idle connection timeout in seconds
      connect_timeout: 10, // Connection timeout in seconds
    });
  }

  /**
   * Get singleton instance of DatabaseService
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Get SQL client instance
   */
  public getClient(): postgres.Sql {
    return this.sql;
  }

  /**
   * Execute a query with parameters
   */
  public async query<T>(query: string, ...params: any[]): Promise<T[]> {
    try {
      return await this.sql.unsafe(query, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    await this.sql.end();
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
