import { generateId } from 'lucia';
import { z } from 'zod';

import { requireOrg, useDb } from '../../composables';
import { groupMembers, groups } from '../../db';
import { logAuditEvent } from '../../services/audit';

const bodySchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
});

const GROUP_ID_LENGTH = 15;

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { name, description } = await readValidatedBody(event, bodySchema.parse);

  const db = await useDb();
  requireOrg(event);

  const newGroup = {
    id: `grp_${generateId(GROUP_ID_LENGTH)}`,
    organizationId: org.id,
    name,
    description,
    createdAt: new Date(),
  };

  // Add the creator as the first member
  const firstMember = {
    groupId: newGroup.id,
    userId: user.id,
    role: 'admin' as const,
  };

  await db.transaction(async (tx) => {
    await tx.insert(groups).values(newGroup);
    await tx.insert(groupMembers).values(firstMember);
  });

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'group.create',
    targetId: newGroup.id,
    targetType: 'group',
    details: { name, description },
  });

  return newGroup;
});
