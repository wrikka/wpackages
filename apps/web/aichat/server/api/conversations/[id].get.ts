import { eq } from 'drizzle-orm';
import { defineEventHandler, getRouterParam } from 'h3';
import { messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const conversationId = getRouterParam(event, 'id');

  if (!conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID is required',
    });
  }

  const conversationMessages = await db.select().from(messages).where(
    eq(messages.conversationId, conversationId),
  );

  return conversationMessages;
});
