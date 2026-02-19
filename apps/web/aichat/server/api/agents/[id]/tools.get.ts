import { eq } from 'drizzle-orm';
import { requireAuth, useDb } from '../../../composables';
import { agentTools, tools } from '../../../db';

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const agentId = getRouterParam(event, 'id');

  if (!agentId) {
    throw createError({ statusCode: 400, message: 'Agent ID is required' });
  }

  const db = await useDb();

  const agentToolsList = await db
    .select({
      id: tools.id,
      name: tools.name,
      description: tools.description,
    })
    .from(agentTools)
    .leftJoin(tools, eq(agentTools.toolId, tools.id))
    .where(eq(agentTools.agentId, agentId));

  return agentToolsList;
});
