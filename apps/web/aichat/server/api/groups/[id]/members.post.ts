import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { requireOrg, useDb } from '../../../composables';
import { groupMembers } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

const bodySchema = z.object({
  userIds: z.array(z.string()),
  role: z.enum(['admin', 'member']).default('member'),
});

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const groupId = getRouterParam(event, 'id');
  if (!groupId) {
    throw createError({ statusCode: 400, statusMessage: 'Group ID is required' });
  }

  const { userIds, role } = await readValidatedBody(event, bodySchema.parse);

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

  const newMembers = userIds.map(userId => ({
    groupId,
    userId,
    role,
  }));

  if (newMembers.length > 0) {
    await db.insert(groupMembers).values(newMembers);

    await logAuditEvent({
      actorId: user.id,
      organizationId: org.id,
      action: 'group.members.add',
      targetId: groupId,
      targetType: 'group',
      details: { userIds, role },
    });
  }

  return { success: true };
});
