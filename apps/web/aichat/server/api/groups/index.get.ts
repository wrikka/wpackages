import { and, eq } from 'drizzle-orm';

import { requireOrg, useDb } from '../../composables';
import { groupMembers, groups } from '../../db';

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const db = await useDb();
  requireOrg(event);

  const groupList = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdAt: groups.createdAt,
      // Subquery to get the user's role in the group
      userRole: db.select({ role: groupMembers.role }).from(groupMembers).where(
        and(eq(groupMembers.groupId, groups.id), eq(groupMembers.userId, user.id)),
      ).limit(1),
    })
    .from(groups)
    .where(eq(groups.organizationId, org.id))
    .orderBy(groups.name);

  return groupList.map(group => ({
    ...group,
    // Drizzle subqueries return an array, so we extract the role or set it to null
    userRole: group.userRole[0]?.role || null,
  }));
});
