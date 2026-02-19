import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../../composables';
import { organizationPlugins } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const pluginId = getRouterParam(event, 'id');
  if (!pluginId) {
    throw createError({ statusCode: 400, statusMessage: 'Plugin ID is required' });
  }

  const db = await useDb();

  await db
    .delete(organizationPlugins)
    .where(and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, pluginId),
    ));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'plugin.uninstall',
    targetId: pluginId,
    targetType: 'plugin',
  });

  return { success: true };
});
