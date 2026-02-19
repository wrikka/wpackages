import { and, eq, exists, or, sql } from 'drizzle-orm';

import { requireOrg, useDb } from '../../composables';
import {
  groupMembers,
  knowledgeBaseFiles,
  knowledgeBaseGroupPermissions,
  knowledgeBases,
} from '../../db';

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const kbId = getRouterParam(event, 'id');
  if (!kbId) {
    throw createError({ statusCode: 400, statusMessage: 'Knowledge Base ID is required' });
  }

  const db = await useDb();
  requireOrg(event);

  const userId = user.id;

  const [kb] = await db
    .select()
    .from(knowledgeBases)
    .where(
      and(
        eq(knowledgeBases.id, kbId),
        eq(knowledgeBases.organizationId, org.id),
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
    );

  if (!kb) {
    throw createError({ statusCode: 404, statusMessage: 'Knowledge Base not found' });
  }

  // Drizzle doesn't support `with` on raw select, so we fetch files separately.
  const files = await db.query.knowledgeBaseFiles.findMany({
    where: eq(knowledgeBaseFiles.knowledgeBaseId, kb.id),
  });

  return {
    ...kb,
    files,
  };
});
