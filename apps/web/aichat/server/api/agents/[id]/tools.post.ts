import { z } from 'zod';
import { requireAuth, useDb } from '../../../composables';
import { agentTools } from '../../../db';

const ToolInput = z.object({
  toolId: z.string(),
});

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const agentId = getRouterParam(event, 'id');

  if (!agentId) {
    throw createError({ statusCode: 400, message: 'Agent ID is required' });
  }

  const body = await readBody(event);
  const validation = ToolInput.safeParse(body);

  if (!validation.success) {
    throw createError({ statusCode: 400, message: 'Invalid input, toolId is required' });
  }

  const { toolId } = validation.data;
  const db = await useDb();

  // TODO: Verify user has permission to edit this agent

  await db.insert(agentTools).values({
    agentId,
    toolId,
  });

  return { status: 'ok' };
});
