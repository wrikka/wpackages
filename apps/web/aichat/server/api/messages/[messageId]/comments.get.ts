import { eq } from 'drizzle-orm';

import { messageComments, users } from '@aichat/db';
import { requireAuth, useDb } from '../../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const messageId = getRouterParam(event, 'messageId');
  if (!messageId) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID is required' });
  }

  const db = await useDb();

  // TODO: Verify user has access to this message's session

  const comments = await db
    .select({
      id: messageComments.id,
      content: messageComments.content,
      createdAt: messageComments.createdAt,
      userId: users.id,
      username: users.username,
    })
    .from(messageComments)
    .leftJoin(users, eq(messageComments.userId, users.id))
    .where(eq(messageComments.messageId, messageId))
    .orderBy(messageComments.createdAt);

  return comments;
});
