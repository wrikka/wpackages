import type { Config } from 'drizzle-kit';

export default {
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.D1_DATABASE_PATH || 'file:./.data/mock.db',
  },
} satisfies Config;
