import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../../composables';
import { organizationPlugins, plugins } from '../../../db';

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const org = requireOrg(event);

  const pluginId = getRouterParam(event, 'id');
  if (!pluginId) {
    throw createError({ statusCode: 400, statusMessage: 'Plugin ID is required' });
  }

  const db = await useDb();

  const [row] = await db
    .select({ plugin: plugins, orgPlugin: organizationPlugins })
    .from(organizationPlugins)
    .innerJoin(plugins, eq(organizationPlugins.pluginId, plugins.id))
    .where(and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, pluginId),
    ));

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Plugin not found' });
  }

  return {
    ...row.plugin,
    enabled: row.orgPlugin.enabled,
    config: row.orgPlugin.config,
    installedAt: row.orgPlugin.installedAt,
    updatedAt: row.orgPlugin.updatedAt,
  };
});
