import { createDbClient } from '../db';

// Singleton database connection
let db: Awaited<ReturnType<typeof createDbClient>> | null = null;
let dbPromise: Promise<Awaited<ReturnType<typeof createDbClient>>> | null = null;

export async function useDb() {
  if (!db) {
    if (!dbPromise) {
      dbPromise = createDbClient();
    }
    db = await dbPromise;
  }
  return db;
}
