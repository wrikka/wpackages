import { eq } from 'drizzle-orm';
import { scheduledAgentRuns } from '../../db';
import { createApiHandler, parseQueryParams, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const { scheduledPromptId } = parseQueryParams(event, {
    scheduledPromptId: 'string',
  });

  if (!scheduledPromptId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'scheduledPromptId is required',
    });
  }

  const runs = await db.query.scheduledAgentRuns.findMany({
    where: eq(scheduledAgentRuns.scheduledPromptId, scheduledPromptId),
    orderBy: (scheduledAgentRuns) => [scheduledAgentRuns.createdAt],
  });

  return createSuccessResponse(runs);
});
