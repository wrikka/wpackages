import { and, eq, like, sql } from 'drizzle-orm';
import { requireAuth, requireOrg, useDb } from '~/server/composables';
import { conversations, messages } from '~/server/database/schema';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);
  const { q } = getQuery(event);

  if (!q || typeof q !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Search query is required' });
  }

  const db = await useDb();

  // Find conversation IDs that have matching messages
  const messageMatchConvIds = await db
    .selectDistinct({ conversationId: messages.conversationId })
    .from(messages)
    .where(and(
      like(messages.content, `%${q}%`),
    ));

  const conversationIds = messageMatchConvIds.map(m => m.conversationId);

  // Find conversations that match by title OR have matching messages
  const searchResults = await db.query.conversations.findMany({
    where: and(
      eq(conversations.userId, user.id),
      // eq(conversations.organizationId, org.id), // Assuming organization check is needed
      sql`${conversations.title} like ${`%${q}%`} or ${conversations.id} in ${conversationIds}`,
    ),
    orderBy: (conversations, { desc }) => [desc(conversations.createdAt)],
    limit: 50,
  });

  return searchResults;
});
