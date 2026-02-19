import { and, eq } from 'drizzle-orm';

import { generateId } from 'lucia';
import { requireOrg, useDb } from '../../composables';
import { agentPromptHistory, agents } from '../../db';
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

  const body = await readBody(event);
  const { name, description, systemPrompt } = body;
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Agent name is required' });
  }

  const db = useDb();

  const currentAgent = await db.query.agents.findFirst({
    where: and(eq(agents.id, agentId), eq(agents.organizationId, event.context.org.id)),
  });

  if (!currentAgent) {
    throw createError({ statusCode: 404, statusMessage: 'Agent not found' });
  }

  // Save history if system prompt has changed
  if (systemPrompt && systemPrompt !== currentAgent.systemPrompt) {
    await db.insert(agentPromptHistory).values({
      id: generateId(15),
      agentId,
      systemPrompt,
      createdAt: new Date(),
    });
  }

  // TODO: Add permission check (e.g., only creator or org owner can edit)
  await db
    .update(agents)
    .set({ name, description, systemPrompt })
    .where(eq(agents.id, agentId));

  return { success: true };
});
