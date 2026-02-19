import { and, eq, like, sql } from 'drizzle-orm';
import { z } from 'zod';
import { searchIndex } from '../../database/schema/features';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const query = getQuery(event);
  const db = useDb();

  const { q, type } = query;
  if (!q || typeof q !== 'string') {
    throw createError({ statusCode: 400, message: 'Query parameter required' });
  }

  let whereClause = and(
    eq(searchIndex.userId, user.id),
    like(searchIndex.content, `%${q}%`),
  );

  if (type && typeof type === 'string') {
    whereClause = and(whereClause, eq(searchIndex.type, type as any));
  }

  const results = await db.query.searchIndex.findMany({
    where: whereClause,
    limit: 50,
    orderBy: (si, { desc }) => [desc(si.updatedAt)],
  });

  return results;
});
