import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

const sqlite = new Database('./server/db/sqlite.db')
export const db = drizzle(sqlite, { schema })

export * from '../db/schema'
