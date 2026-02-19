import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { messageComments } from '@aichat/db';
import { requireAuth, useDb } from '../../../../composables';

const CommentInput = z.object({
  content: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const messageId = getRouterParam(event, 'messageId');
  const commentId = getRouterParam(event, 'commentId');
  if (!messageId || !commentId) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID and Comment ID are required' });
  }

  const body = await readBody(event);
  const validation = CommentInput.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' });
  }

  const { content } = validation.data;
  const db = await useDb();

  // Verify user owns the comment
  const [updatedComment] = await db
    .update(messageComments)
    .set({ content })
    .where(and(eq(messageComments.id, commentId), eq(messageComments.userId, user.id)))
    .returning();

  if (!updatedComment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Comment not found or you do not have permission to edit it',
    });
  }

  return updatedComment;
});
