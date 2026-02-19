import { desc, eq } from 'drizzle-orm';

import { requireAuth, useDb } from '../../composables';
import { agentPromptHistory } from '../../db';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const agentId = getRouterParam(event, 'id');
  if (!agentId) {
    throw createError({ statusCode: 400, statusMessage: 'Agent ID is required' });
  }

  const db = useDb();

  // TODO: Add permission check

  const history = await db
    .select()
    .from(agentPromptHistory)
    .where(eq(agentPromptHistory.agentId, agentId))
    .orderBy(desc(agentPromptHistory.createdAt));

  return history;
});
