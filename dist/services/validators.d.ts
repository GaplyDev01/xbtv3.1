import { z } from 'zod';
/**
 * Schema for validating Solana addresses
 */
export declare const solanaAddressSchema: z.ZodString;
/**
 * Schema for token details request parameters
 */
export declare const tokenDetailsSchema: z.ZodObject<{
    id: z.ZodString;
    days: z.ZodUnion<[z.ZodNumber, z.ZodLiteral<"max">]>;
    interval: z.ZodOptional<z.ZodEnum<["5m", "hourly", "daily"]>>;
    precision: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    days: number | "max";
    id: string;
    precision?: number | undefined;
    interval?: "5m" | "hourly" | "daily" | undefined;
}, {
    days: number | "max";
    id: string;
    precision?: number | undefined;
    interval?: "5m" | "hourly" | "daily" | undefined;
}>;
/**
 * Schema for market data request options
 */
export declare const marketDataOptionsSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    order: z.ZodOptional<z.ZodEnum<["market_cap_asc", "market_cap_desc", "volume_asc", "volume_desc", "id_asc", "id_desc"]>>;
    perPage: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
    sparkline: z.ZodOptional<z.ZodBoolean>;
    priceChangePercentage: z.ZodOptional<z.ZodArray<z.ZodEnum<["1h", "24h", "7d", "14d", "30d", "200d", "1y"]>, "many">>;
    precision: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    precision?: number | undefined;
    category?: string | undefined;
    order?: "market_cap_asc" | "market_cap_desc" | "volume_asc" | "volume_desc" | "id_asc" | "id_desc" | undefined;
    page?: number | undefined;
    sparkline?: boolean | undefined;
    perPage?: number | undefined;
    priceChangePercentage?: ("1h" | "24h" | "7d" | "14d" | "30d" | "200d" | "1y")[] | undefined;
}, {
    precision?: number | undefined;
    category?: string | undefined;
    order?: "market_cap_asc" | "market_cap_desc" | "volume_asc" | "volume_desc" | "id_asc" | "id_desc" | undefined;
    page?: number | undefined;
    sparkline?: boolean | undefined;
    perPage?: number | undefined;
    priceChangePercentage?: ("1h" | "24h" | "7d" | "14d" | "30d" | "200d" | "1y")[] | undefined;
}>;
