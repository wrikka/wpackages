import { and, eq } from 'drizzle-orm';

import { useDb } from '../../composables';
import { organizations } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const orgId = getRouterParam(event, 'id');
  if (!orgId) {
    throw createError({ statusCode: 400, statusMessage: 'Organization ID is required' });
  }

  const body = await readBody(event);
  const { name } = body;
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Organization name is required' });
  }

  const db = useDb();
  // TODO: Check if user is the owner of this org
  await db
    .update(organizations)
    .set({ name })
    .where(and(eq(organizations.id, orgId), eq(organizations.ownerId, user.id)));

  return { success: true };
});
