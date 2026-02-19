import { defineEventHandler, getRouterParam, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const conversationId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { content } = body;

  if (!conversationId || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and content are required',
    });
  }

  // 1. Save user's message
  const userMessage = {
    id: uuidv4(),
    conversationId,
    role: 'user' as const,
    content,
    createdAt: new Date(),
  };
  await db.insert(messages).values(userMessage);

  // 2. Generate and save assistant's (mock) response
  const assistantMessage = {
    id: uuidv4(),
    conversationId,
    role: 'assistant' as const,
    content: `This is a mock AI response to: "${content}"`,
    createdAt: new Date(),
  };
  await db.insert(messages).values(assistantMessage);

  // 3. Return the new assistant message so the UI can display it
  return assistantMessage;
});
