import { eq, and, gte, lte } from 'drizzle-orm';
import { usageStats } from '../../db';
import { createApiHandler, parseQueryParams, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const { startDate, endDate } = parseQueryParams(event, {
    startDate: 'string',
    endDate: 'string',
  });

  const stats = await db.query.usageStats.findMany({
    where: and(
      eq(usageStats.organizationId, org.id),
      startDate ? gte(usageStats.date, startDate) : undefined,
      endDate ? lte(usageStats.date, endDate) : undefined,
    ),
    orderBy: (usageStats) => [usageStats.date],
  });

  return createSuccessResponse(stats);
});
