import { and, eq } from 'drizzle-orm';

import { requireOrg, useDb } from '../../../composables';
import { groupMembers, groups } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const groupId = getRouterParam(event, 'id');
  if (!groupId) {
    throw createError({ statusCode: 400, statusMessage: 'Group ID is required' });
  }

  const db = await useDb();
  requireOrg(event);

  // Verify user is an admin of the group
  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)));

  if (membership?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
  }

  // Deleting a group will cascade and delete memberships due to foreign key constraints
  await db.delete(groups).where(and(eq(groups.id, groupId), eq(groups.organizationId, org.id)));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'group.delete',
    targetId: groupId,
    targetType: 'group',
  });

  return { success: true };
});
