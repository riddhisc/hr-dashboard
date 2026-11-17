import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/lib/env';
import * as schema from './schema';

export const db = env.DATABASE_URL ? drizzle(env.DATABASE_URL, { schema }) : null;
