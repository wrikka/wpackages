import { and, eq, like } from 'drizzle-orm';
import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3';
import { useDb } from '~/server/db';
import { organizationMembers, users } from '~/server/db/schema';

const MEMBER_FETCH_LIMIT = 10;

export default defineEventHandler(async (event) => {
  const organizationId = getRouterParam(event, 'organizationId');
  const { search } = getQuery(event);

  if (!organizationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID is required',
    });
  }

  const db = useDb();

  const conditions = [eq(organizationMembers.organizationId, organizationId)];
  if (typeof search === 'string' && search.trim()) {
    conditions.push(like(users.username, `%${search}%`));
  }

  const members = await db
    .select({
      id: users.id,
      username: users.username,
    })
    .from(organizationMembers)
    .leftJoin(users, eq(organizationMembers.userId, users.id))
    .where(and(...conditions))
    .limit(MEMBER_FETCH_LIMIT);

  return members;
});
