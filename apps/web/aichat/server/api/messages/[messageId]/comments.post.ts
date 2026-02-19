import { generateId } from 'lucia';
import { z } from 'zod';

import { messageComments } from '@aichat/db';
import { requireAuth, useDb } from '../../../composables';

const CommentInput = z.object({
  content: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const messageId = getRouterParam(event, 'messageId');
  if (!messageId) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID is required' });
  }

  const body = await readBody(event);
  const validation = CommentInput.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' });
  }

  const { content } = validation.data;
  const db = await useDb();

  // TODO: Verify user has access to this message's session

  const newComment = {
    id: generateId(15),
    messageId,
    userId: user.id,
    content,
    createdAt: new Date(),
  };

  await db.insert(messageComments).values(newComment);

  return newComment;
});
