import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/db/schema';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.TURSO_CONNECTION_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!url || !authToken) {
      console.warn('Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN environment variables');
      // Return a mock db to prevent build failures - actual usage will fail at runtime
      throw new Error('Database not configured. Please set TURSO_CONNECTION_URL and TURSO_AUTH_TOKEN environment variables.');
    }
    
    const client = createClient({
      url,
      authToken,
    });
    
    _db = drizzle(client, { schema });
  }
  
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    const dbInstance = getDb();
    const value = dbInstance[prop as keyof ReturnType<typeof drizzle>];
    // Ensure execute method is properly forwarded
    if (prop === 'execute' && typeof value === 'function') {
      return value.bind(dbInstance);
    }
    return value;
  }
}) as ReturnType<typeof drizzle>;

export type Database = typeof db;