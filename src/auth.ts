import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

const credentialsSchema = z.object({ email: z.email(), password: z.string().min(8) });
export const { handlers, signIn, signOut, auth } = NextAuth({ providers: [Credentials({ credentials: { email: {}, password: {} }, authorize: async (credentials) => { const parsed = credentialsSchema.safeParse(credentials); if (!parsed.success) return null; return { id: 'demo-admin', name: 'Priya Shah', email: parsed.data.email, role: 'admin' }; } })], pages: { signIn: '/login' }, session: { strategy: 'jwt' } });
