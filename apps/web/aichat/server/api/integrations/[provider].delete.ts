import { and, eq } from 'drizzle-orm';
import { requireAuth, useDb } from '../../../composables';
import { userIntegrations } from '../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const provider = getRouterParam(event, 'provider');

  if (!provider) {
    throw createError({ statusCode: 400, message: 'Provider is required' });
  }

  const db = await useDb();

  await db.delete(userIntegrations)
    .where(and(
      eq(userIntegrations.userId, user.id),
      eq(userIntegrations.provider, provider),
    ));

  return { status: 'ok' };
});
