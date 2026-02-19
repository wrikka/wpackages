import { eq } from 'drizzle-orm';
import { codeExecutions } from '../../../db';
import { createApiHandler, getEntityById, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Execution ID is required' });
  }

  const execution = await getEntityById(db, codeExecutions, id);
  if (!execution) {
    throw createError({ statusCode: 404, statusMessage: 'Execution not found' });
  }

  return createSuccessResponse(execution);
});
