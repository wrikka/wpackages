import { and, desc, eq, exists, or, sql } from 'drizzle-orm';

import { requireOrg, useDb } from '../../composables';
import { groupMembers, knowledgeBaseGroupPermissions, knowledgeBases } from '../../db';

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const db = await useDb();
  requireOrg(event);

  const orgId = org.id;
  const userId = user.id;

  const kbList = await db
    .select()
    .from(knowledgeBases)
    .where(
      and(
        eq(knowledgeBases.organizationId, orgId),
        or(
          // User is the owner of the knowledge base
          eq(knowledgeBases.userId, userId),
          // Or user is a member of a group that has access to the knowledge base
          exists(
            db.select({ one: sql`1` })
              .from(knowledgeBaseGroupPermissions)
              .innerJoin(
                groupMembers,
                eq(knowledgeBaseGroupPermissions.groupId, groupMembers.groupId),
              )
              .where(
                and(
                  eq(knowledgeBaseGroupPermissions.knowledgeBaseId, knowledgeBases.id),
                  eq(groupMembers.userId, userId),
                ),
              ),
          ),
        ),
      ),
    )
    .orderBy(desc(knowledgeBases.createdAt));

  return kbList;
});
