import { eq } from 'drizzle-orm';
import { defineEventHandler } from 'h3';
import { conversations } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// For now, we'll assume a hardcoded user ID.
// In a real app, you'd get this from session/auth.
const MOCK_USER_ID = 'user_01';

export default defineEventHandler(async () => {
  const userConversations = await db.select().from(conversations).where(
    eq(conversations.userId, MOCK_USER_ID),
  );

  return userConversations;
});
