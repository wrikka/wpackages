import { and, eq } from 'drizzle-orm';

import { requireOrg, useDb } from '../../composables';
import { agents } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  requireOrg(event);

  const agentId = getRouterParam(event, 'id');
  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: 'Agent ID is required' });
  }

  const db = useDb();
  const agent = await db.query.agents.findFirst({
    where: and(
      eq(agents.id, agentId),
      eq(agents.organizationId, event.context.org.id),
    ),
  });

  if (!agent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent not found' });
  }

  return agent;
});
