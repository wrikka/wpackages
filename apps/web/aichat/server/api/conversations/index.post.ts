import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { conversations } from '~/server/database/schema';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const { userId, title } = body;

  if (!userId || !title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID and title are required',
    });
  }

  const newConversation = {
    id: uuidv4(),
    userId,
    title,
    createdAt: new Date(),
  };

  await db.insert(conversations).values(newConversation);

  return newConversation;
});
