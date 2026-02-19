import { db } from '~/server/db';
import { workflowCheckpoints } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const runId = getRouterParam(event, 'runId');

  if (!runId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Run ID is required',
    });
  }

  try {
    const result = await db
      .select()
      .from(workflowCheckpoints)
      .where(eq(workflowCheckpoints.runId, runId))
      .limit(1);

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Workflow run not found',
      });
    }

    return { run: result[0] };
  } catch (error) {
    console.error(`Error fetching workflow run ${runId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch workflow run',
    });
  }
});
