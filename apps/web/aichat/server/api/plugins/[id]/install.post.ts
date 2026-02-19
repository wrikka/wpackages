import { eq, and } from 'drizzle-orm';
import { organizationPlugins, plugins } from '../../../db';
import { createApiHandler, getEntityById, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const body = await readBody(event);
  const { pluginId, config = {} } = body;

  if (!pluginId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'pluginId is required',
    });
  }

  const plugin = await getEntityById(db, plugins, pluginId);
  if (!plugin) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Plugin not found',
    });
  }

  const existing = await db.query.organizationPlugins.findFirst({
    where: and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, pluginId),
    ),
  });

  if (existing) {
    await db.update(organizationPlugins)
      .set({ enabled: true, config, updatedAt: new Date() })
      .where(eq(organizationPlugins.pluginId, pluginId));
  } else {
    await db.insert(organizationPlugins).values({
      organizationId: org.id,
      pluginId,
      enabled: true,
      config,
      installedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return createSuccessResponse({ success: true });
});
