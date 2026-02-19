import { eq } from 'drizzle-orm';
import { scheduledAgentRuns } from '../../../db';
import { createApiHandler, getEntityById, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Run ID is required' });
  }

  const run = await getEntityById(db, scheduledAgentRuns, id);
  if (!run) {
    throw createError({ statusCode: 404, statusMessage: 'Run not found' });
  }

  await db.update(scheduledAgentRuns)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(scheduledAgentRuns.id, id));

  return createSuccessResponse({ success: true });
});
