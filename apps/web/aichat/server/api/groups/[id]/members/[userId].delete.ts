import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { requireOrg, useDb } from '../../../../composables';
import { groupMembers } from '../../../../db';
import { logAuditEvent } from '../../../../services/audit';

const paramsSchema = z.object({
  id: z.string(), // Group ID
  userId: z.string(),
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

  // Prevent admin from removing themselves if they are the last admin
  if (user.id === targetUserId && membership.role === 'admin') {
    const adminCount = await db
      .select({ count: sql`count(*)` })
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.role, 'admin')));

    if (adminCount[0].count === 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot remove the last admin from a group.',
      });
    }
  }

  await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId)));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'group.members.remove',
    targetId: groupId,
    targetType: 'group',
    details: { userId: targetUserId },
  });

  return { success: true };
});
