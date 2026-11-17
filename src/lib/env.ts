import { z } from 'zod';
const envSchema = z.object({ DATABASE_URL: z.string().url().optional(), AUTH_SECRET: z.string().min(16).optional(), NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000') });
export const env = envSchema.parse({ DATABASE_URL: process.env.DATABASE_URL, AUTH_SECRET: process.env.AUTH_SECRET, NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL });
