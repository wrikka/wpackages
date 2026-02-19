import { eq } from 'drizzle-orm';
import { plugins } from '../../../db';
import { createApiHandler, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db }) => {
  const availablePlugins = await db.query.plugins.findMany();

  return createSuccessResponse(availablePlugins);
});
