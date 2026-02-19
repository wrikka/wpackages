import { and, eq, exists, like, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { requireOrg, useDb } from '../../composables';
import {
  groupMembers,
  groups,
  knowledgeBaseGroupPermissions,
  knowledgeBases,
  messages,
} from '../../db';

const querySchema = z.object({
  q: z.string().min(1),
  type: z.enum(['all', 'message', 'knowledge_base', 'group']).optional().default('all'),
});

const SEARCH_LIMIT = 10;

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const query = await getValidatedQuery(event, querySchema.parse);

  const db = await useDb();
  requireOrg(event);
  const userId = user.id;
  const orgId = org.id;
  const searchQuery = `%${query}%`;

  const searchPromises = [];

  if (query.type === 'all' || query.type === 'message') {
    searchPromises.push(
      // Search Messages
      db.select({
        id: messages.id,
        title: messages.content,
        type: sql`'message' as const`,
        url: sql`'/chat/' || messages.chat_session_id`,
      })
        .from(messages)
        .where(like(messages.content, searchQuery))
        .limit(SEARCH_LIMIT),
    );
  }

  if (query.type === 'all' || query.type === 'knowledge_base') {
    searchPromises.push(
      // Search Knowledge Bases
      db.select({
        id: knowledgeBases.id,
        title: knowledgeBases.name,
        type: sql`'knowledge_base' as const`,
        url: sql`'/kb/' || knowledgeBases.id`,
      })
        .from(knowledgeBases)
        .where(and(
          eq(knowledgeBases.organizationId, orgId),
          or(like(knowledgeBases.name, searchQuery), like(knowledgeBases.description, searchQuery)),
          or(
            eq(knowledgeBases.userId, userId),
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
        ))
        .limit(SEARCH_LIMIT),
    );
  }

  if (query.type === 'all' || query.type === 'group') {
    searchPromises.push(
      // Search Groups
      db.select({
        id: groups.id,
        title: groups.name,
        type: sql`'group' as const`,
        url: sql`'/settings/groups/' || groups.id`,
      })
        .from(groups)
        .where(and(
          eq(groups.organizationId, orgId),
          or(like(groups.name, searchQuery), like(groups.description, searchQuery)),
        ))
        .limit(SEARCH_LIMIT),
    );
  }

  const results = await Promise.all(searchPromises);
  return results.flat();
});
