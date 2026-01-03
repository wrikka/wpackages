import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./index";

const pool = new Pool({
	connectionString: process.env.DB_URL,
});

export const db = drizzle(pool, { schema });
