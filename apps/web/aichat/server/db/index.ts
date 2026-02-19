import { drizzle } from 'drizzle-orm/d1';
import { ensureMockDbDirectory, ensureMockDbFile, getMockDbPath } from './mockDb';
import { initMockSchema } from './mockSchema';
import * as schema from './schema';

export async function createDbClient() {
  const config = useRuntimeConfig();
  const d1DatabasePath = config.d1DatabasePath;
  const isProduction = process.env.NODE_ENV === 'production';

  // For development without D1, use mock DB
  if (!d1DatabasePath && !isProduction) {
    ensureMockDbDirectory();
    ensureMockDbFile();

    // Use local SQLite for development
    const { default: Database } = await import('better-sqlite3');
    const sqlite = new Database(getMockDbPath());
    const db = drizzle(sqlite, { schema });
    initMockSchema(db);
    return db;
  }

  // For production with D1
  if (!d1DatabasePath && isProduction) {
    throw new Error(
      'Database is not configured. Please set D1_DATABASE_PATH.',
    );
  }

  // Use D1 database (available in Cloudflare Workers)
  return drizzle(globalThis.D1Database, { schema });
}

export * from './schema';
