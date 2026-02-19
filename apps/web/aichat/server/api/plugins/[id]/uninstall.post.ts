import { eq, and } from 'drizzle-orm';
import { organizationPlugins } from '../../../db';
import { createApiHandler, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Plugin ID is required' });
  }

  await db.update(organizationPlugins)
    .set({ enabled: false })
    .where(and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, id),
    ));

  return createSuccessResponse({ success: true });
});
