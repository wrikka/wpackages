import { and, eq } from 'drizzle-orm';
import { requireAuth, useDb } from '../../../composables';
import { knowledgeBases, knowledgeBaseSources } from '../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const kbId = getRouterParam(event, 'id');

  if (!kbId) {
    throw createError({ statusCode: 400, message: 'Knowledge Base ID is required' });
  }

  const db = await useDb();

  // First, verify the user has access to this KB
  const kb = await db.query.knowledgeBases.findFirst({
    where: and(
      eq(knowledgeBases.id, kbId),
      eq(knowledgeBases.userId, user.id), // Simplified access check for now
    ),
  });

  if (!kb) {
    throw createError({
      statusCode: 404,
      message: 'Knowledge Base not found or you do not have access',
    });
  }

  // Then, fetch the sources
  const sources = await db.query.knowledgeBaseSources.findMany({
    where: eq(knowledgeBaseSources.knowledgeBaseId, kbId),
    orderBy: (sources, { desc }) => [desc(sources.createdAt)],
  });

  return sources;
});
