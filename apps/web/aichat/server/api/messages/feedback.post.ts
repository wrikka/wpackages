import { z } from 'zod';
import { requireAuth, useDb } from '~/server/composables';
import { messageFeedback } from '~/server/database/schema';

const feedbackSchema = z.object({
  messageId: z.string(),
  type: z.enum(['like', 'dislike']),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);

  const validation = feedbackSchema.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
  }

  const { messageId, type } = validation.data;

  try {
    const db = await useDb();
    await db.insert(messageFeedback).values({
      messageId,
      userId: user.id,
      feedbackType: type,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to save message feedback', error);
    throw createError({ statusCode: 500, statusMessage: 'Could not save feedback' });
  }
});
