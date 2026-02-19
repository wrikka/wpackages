import { db } from '~/server/db';
import { workflowCheckpoints } from '~/server/db/schema';

export default defineEventHandler(async (event) => {
  try {
    const runs = await db.select().from(workflowCheckpoints).orderBy(workflowCheckpoints.updatedAt);
    return { runs };
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch workflow runs',
    });
  }
});
