import { and, eq } from 'drizzle-orm';

import { messageComments } from '@aichat/db';
import { requireAuth, useDb } from '../../../../composables';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const messageId = getRouterParam(event, 'messageId');
  const commentId = getRouterParam(event, 'commentId');
  if (!messageId || !commentId) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID and Comment ID are required' });
  }

  const db = await useDb();

  // Verify user owns the comment
  const [deletedComment] = await db
    .delete(messageComments)
    .where(and(eq(messageComments.id, commentId), eq(messageComments.userId, user.id)))
    .returning();

  if (!deletedComment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found or you do not have permission to delete it',
    });
  }

  return { status: 'ok' };
});
