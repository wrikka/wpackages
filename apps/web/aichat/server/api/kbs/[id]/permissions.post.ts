import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import { createDbClient, knowledgeBaseGroupPermissions } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

const paramsSchema = z.object({
  id: z.string(), // Knowledge Base ID
});

const bodySchema = z.object({
  groupIds: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const db = await createDbClient();
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { id: knowledgeBaseId } = await getValidatedRouterParams(event, paramsSchema.parse);
  const { groupIds } = await readValidatedBody(event, bodySchema.parse);

  // TODO: Verify user is owner/admin of the knowledge base and the groups

  // Get existing permissions for this KB
  const existingPermissions = await db
    .select({ groupId: knowledgeBaseGroupPermissions.groupId })
    .from(knowledgeBaseGroupPermissions)
    .where(eq(knowledgeBaseGroupPermissions.knowledgeBaseId, knowledgeBaseId));

  const existingGroupIds = existingPermissions.map(permission => permission.groupId);

  const groupIdsToAdd = groupIds.filter(id => !existingGroupIds.includes(id));
  const groupIdsToRemove = existingGroupIds.filter(id => !groupIds.includes(id));

  // Start a transaction to ensure atomicity
  await db.transaction(async (tx) => {
    if (groupIdsToRemove.length) {
      await tx
        .delete(knowledgeBaseGroupPermissions)
        .where(and(
          eq(knowledgeBaseGroupPermissions.knowledgeBaseId, knowledgeBaseId),
          inArray(knowledgeBaseGroupPermissions.groupId, groupIdsToRemove),
        ));
    }

    if (groupIdsToAdd.length) {
      await tx
        .insert(knowledgeBaseGroupPermissions)
        .values(groupIdsToAdd.map(groupId => ({
          groupId,
          knowledgeBaseId,
        })));
    }
  });

  if (groupIdsToAdd.length > 0 || groupIdsToRemove.length > 0) {
    await logAuditEvent({
      action: 'knowledge_base.permissions.update',
      actorId: user.id,
      organizationId: org.id,
      targetId: knowledgeBaseId,
      targetType: 'knowledge_base',
      details: { added: groupIdsToAdd, removed: groupIdsToRemove },
    });
  }

  return { success: true };
});
