import { eq } from 'drizzle-orm';
import { agentStats } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const stats = await db.query.agentStats.findMany({
    where: eq(agentStats.organizationId, org.id),
    orderBy: (agentStats) => [agentStats.usageCount],
  });

  return createSuccessResponse(stats);
});
