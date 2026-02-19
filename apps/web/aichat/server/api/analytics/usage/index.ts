import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { usageStats } from '../../database/schema/features';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const query = getQuery(event);
  const db = useDb();

  const startDate = query.startDate
    ? new Date(query.startDate as string)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = query.endDate ? new Date(query.endDate as string) : new Date();

  const stats = await db.query.usageStats.findMany({
    where: and(
      eq(usageStats.userId, user.id),
      gte(usageStats.date, startDate.toISOString().split('T')[0]),
      lte(usageStats.date, endDate.toISOString().split('T')[0]),
    ),
    orderBy: (s, { asc }) => [asc(s.date)],
  });

  const totals = stats.reduce((acc, day) => ({
    totalTokens: acc.totalTokens + day.totalTokens,
    totalCost: acc.totalCost + day.estimatedCost,
    totalRequests: acc.totalRequests + day.requestCount,
  }), { totalTokens: 0, totalCost: 0, totalRequests: 0 });

  return { stats, totals };
});
