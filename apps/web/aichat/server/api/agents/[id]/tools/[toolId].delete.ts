import { and, eq } from 'drizzle-orm';
import { agentTools } from '../../../../db';
import { requireAuth, useDb } from '../../../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const agentId = getRouterParam(event, 'id');
  const toolId = getRouterParam(event, 'toolId');

  if (!agentId || !toolId) {
    throw createError({ statusCode: 400, message: 'Agent ID and Tool ID are required' });
  }

  const db = await useDb();

  // TODO: Verify user has permission to edit this agent

  await db.delete(agentTools)
    .where(and(
      eq(agentTools.agentId, agentId),
      eq(agentTools.toolId, toolId)
    ));

  return { status: 'ok' };
});
