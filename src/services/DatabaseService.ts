import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a single database connection for server-side operations
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'verify-full',
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
});

/**
 * Execute a query with parameters
 */
export async function query<T>(query: string, ...params: any[]): Promise<T[]> {
  try {
    return await sql.unsafe(query, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function close(): Promise<void> {
  await sql.end();
}

// Export database functions
export const db = { query, close };
