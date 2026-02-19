import { and, eq } from 'drizzle-orm';

import { requireOrg, useDb } from '../../../composables';
import { groupMembers, groups, users } from '../../../db';

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

  // Get group details
  const [group] = await db
    .select()
    .from(groups)
    .where(and(eq(groups.id, groupId), eq(groups.organizationId, org.id)));

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'Group not found' });
  }

  // Get group members
  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: groupMembers.role,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(users.name);

  return {
    ...group,
    members,
  };
});
