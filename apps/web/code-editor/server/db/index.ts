import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// In a real app, you'd want to make sure the DB path is correct, especially in production.
const sqlite = new Database('./server/db/sqlite.db');

export const db = drizzle(sqlite, { schema });
