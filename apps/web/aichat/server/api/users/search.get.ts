import { and, eq, like } from 'drizzle-orm';

import { users } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../composables';

const MAX_SEARCH_RESULTS = 10;

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const org = requireOrg(event);

  const { q } = getQuery(event);

  if (!q || typeof q !== 'string') {
    return [];
  }

  const db = await useDb();

  const searchResults = await db
    .select({
      id: users.id,
      username: users.username,
    })
    .from(users)
    .where(and(eq(users.organizationId, org.id), like(users.username, `%${q}%`)))
    .limit(MAX_SEARCH_RESULTS);

  return searchResults;
});
