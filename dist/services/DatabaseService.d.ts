/**
 * Execute a query with parameters
 */
export declare function query<T>(query: string, ...params: any[]): Promise<T[]>;
/**
 * Close database connection
 */
export declare function close(): Promise<void>;
export declare const db: {
    query: typeof query;
    close: typeof close;
};
