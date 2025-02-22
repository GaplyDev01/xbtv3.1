import { z } from 'zod';

/**
 * Schema for validating Solana addresses
 */
export const solanaAddressSchema = z
  .string()
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address format');

/**
 * Schema for token details request parameters
 */
export const tokenDetailsSchema = z.object({
  id: solanaAddressSchema,
  days: z.union([
    z.number().min(1).max(365),
    z.literal('max')
  ]),
  interval: z.enum(['5m', 'hourly', 'daily']).optional(),
  precision: z.number().min(0).max(18).optional()
});

/**
 * Schema for market data request options
 */
export const marketDataOptionsSchema = z.object({
  category: z.string().optional(),
  order: z.enum([
    'market_cap_asc',
    'market_cap_desc',
    'volume_asc',
    'volume_desc',
    'id_asc',
    'id_desc'
  ]).optional(),
  perPage: z.number().min(1).max(250).optional(),
  page: z.number().min(1).optional(),
  sparkline: z.boolean().optional(),
  priceChangePercentage: z.array(
    z.enum(['1h', '24h', '7d', '14d', '30d', '200d', '1y'])
  ).optional(),
  precision: z.number().min(0).max(18).optional()
});
