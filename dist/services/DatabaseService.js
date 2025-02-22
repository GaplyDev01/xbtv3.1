"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.query = query;
exports.close = close;
const postgres_1 = __importDefault(require("postgres"));
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}
// Create a single database connection for server-side operations
const sql = (0, postgres_1.default)(process.env.DATABASE_URL, {
    ssl: 'verify-full',
    max: 10, // Maximum number of connections
    idle_timeout: 20, // Idle connection timeout in seconds
    connect_timeout: 10, // Connection timeout in seconds
});
/**
 * Execute a query with parameters
 */
async function query(query, ...params) {
    try {
        return await sql.unsafe(query, params);
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
/**
 * Close database connection
 */
async function close() {
    await sql.end();
}
// Export database functions
exports.db = { query, close };
//# sourceMappingURL=DatabaseService.js.map