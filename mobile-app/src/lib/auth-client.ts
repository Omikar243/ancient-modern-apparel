import { createAuthClient } from 'better-auth/react';
import type { AuthClient } from 'better-auth/react';

declare global {
  var __betterAuth__: AuthClient<any> | undefined;
}

export const authClient = globalThis.__betterAuth__ ?? createAuthClient({
  baseURL: 'http://localhost:3000', // Web backend
  apiRoute: '/api/auth',
});

if (process.env.NODE_ENV !== 'production') globalThis.__betterAuth__ = authClient;

export { useSession } from 'better-auth/react';