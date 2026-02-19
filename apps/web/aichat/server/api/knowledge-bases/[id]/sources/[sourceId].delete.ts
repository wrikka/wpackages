import { and, eq } from 'drizzle-orm';
import { requireAuth, useDb } from '../../../../composables';
import { knowledgeBases, knowledgeBaseSources } from '../../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const kbId = getRouterParam(event, 'id');
  const sourceId = getRouterParam(event, 'sourceId');

  if (!kbId || !sourceId) {
    throw createError({ statusCode: 400, message: 'Knowledge Base ID and Source ID are required' });
  }

  const db = await useDb();

  // Verify user has access to this KB
  const kb = await db.query.knowledgeBases.findFirst({
    where: and(
      eq(knowledgeBases.id, kbId),
      eq(knowledgeBases.userId, user.id), // Simplified access check
    ),
  });

  if (!kb) {
    throw createError({
      statusCode: 404,
      message: 'Knowledge Base not found or you do not have access',
    });
  }

  // Delete the source
  await db.delete(knowledgeBaseSources)
    .where(and(
      eq(knowledgeBaseSources.id, sourceId),
      eq(knowledgeBaseSources.knowledgeBaseId, kbId),
    ));

  return { status: 'ok' };
});
