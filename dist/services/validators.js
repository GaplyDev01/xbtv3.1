"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketDataOptionsSchema = exports.tokenDetailsSchema = exports.solanaAddressSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for validating Solana addresses
 */
exports.solanaAddressSchema = zod_1.z
    .string()
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format');
/**
 * Schema for token details request parameters
 */
exports.tokenDetailsSchema = zod_1.z.object({
    id: exports.solanaAddressSchema,
    days: zod_1.z.union([
        zod_1.z.number().min(1).max(365),
        zod_1.z.literal('max')
    ]),
    interval: zod_1.z.enum(['5m', 'hourly', 'daily']).optional(),
    precision: zod_1.z.number().min(0).max(18).optional()
});
/**
 * Schema for market data request options
 */
exports.marketDataOptionsSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    order: zod_1.z.enum([
        'market_cap_asc',
        'market_cap_desc',
        'volume_asc',
        'volume_desc',
        'id_asc',
        'id_desc'
    ]).optional(),
    perPage: zod_1.z.number().min(1).max(250).optional(),
    page: zod_1.z.number().min(1).optional(),
    sparkline: zod_1.z.boolean().optional(),
    priceChangePercentage: zod_1.z.array(zod_1.z.enum(['1h', '24h', '7d', '14d', '30d', '200d', '1y'])).optional(),
    precision: zod_1.z.number().min(0).max(18).optional()
});
//# sourceMappingURL=validators.js.map