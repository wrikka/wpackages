import { and, eq, inArray, or } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { groupMembers, savedPrompts } from '../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const db = await useDb();

  // Find all groups the user is a member of
  const userGroups = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  const userGroupIds = userGroups.map(g => g.groupId);

  const prompts = await db
    .select()
    .from(savedPrompts)
    .where(and(
      eq(savedPrompts.organizationId, org.id),
      or(
        eq(savedPrompts.userId, user.id),
        userGroupIds.length > 0 ? inArray(savedPrompts.groupId, userGroupIds) : undefined,
      ),
    ))
    .orderBy(savedPrompts.name);

  return prompts;
});
