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
  // TODO: Add permission check (e.g., only creator or org owner can delete)
  await db
    .delete(agents)
    .where(and(eq(agents.id, agentId), eq(agents.organizationId, event.context.org.id)));

  return { success: true };
});
