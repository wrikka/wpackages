import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { requireOrg, useDb } from '../../../../composables';
import { groupMembers } from '../../../../db';
import { logAuditEvent } from '../../../../services/audit';

const paramsSchema = z.object({
  id: z.string(), // Group ID
  userId: z.string(),
});

const bodySchema = z.object({
  role: z.enum(['admin', 'member']),
});

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { id: groupId, userId: targetUserId } = await getValidatedRouterParams(
    event,
    paramsSchema.parse,
  );
  const { role } = await readValidatedBody(event, bodySchema.parse);

  const db = await useDb();
  requireOrg(event);

  // Verify acting user is an admin of the group
  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));

  if (membership?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  await db
    .update(groupMembers)
    .set({ role })
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'group.members.update_role',
    targetId: groupId,
    targetType: 'group',
    details: { userId: targetUserId, role },
  });

  return { success: true };
});
