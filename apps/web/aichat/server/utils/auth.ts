import { sessions, users } from '../db/schemas';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import { useDb } from '../composables';

let lucia: Lucia | null = null;

export async function getLucia() {
  if (!lucia) {
    const db = await useDb();
    const adapter = new DrizzleSQLiteAdapter(db, sessions, users);
    lucia = new Lucia(adapter, {
      sessionCookie: {
        attributes: {
          secure: !import.meta.dev,
        },
      },
      getUserAttributes: (attributes) => {
        return {
          githubId: attributes.githubId,
          username: attributes.username,
        };
      },
    });
  }
  return lucia;
}

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  githubId: number;
  username: string;
}
