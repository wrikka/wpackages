import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { requireAuth, requireOrg, useDb } from '../../../composables';
import { organizationPlugins } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

const bodySchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.any()).optional(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const pluginId = getRouterParam(event, 'id');
  if (!pluginId) {
    throw createError({ statusCode: 400, statusMessage: 'Plugin ID is required' });
  }

  const { enabled, config } = await readValidatedBody(event, bodySchema.parse);

  const db = await useDb();

  const [row] = await db
    .select({ pluginId: organizationPlugins.pluginId })
    .from(organizationPlugins)
    .where(and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, pluginId),
    ));

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Plugin is not installed in this organization',
    });
  }

  await db
    .update(organizationPlugins)
    .set({
      enabled: enabled ?? undefined,
      config: config ?? undefined,
      updatedAt: new Date(),
    })
    .where(and(
      eq(organizationPlugins.organizationId, org.id),
      eq(organizationPlugins.pluginId, pluginId),
    ));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'plugin.update',
    targetId: pluginId,
    targetType: 'plugin',
    details: { enabled, config },
  });

  return { success: true };
});
