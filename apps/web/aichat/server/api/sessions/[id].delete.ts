import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { chatSessions, messages } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required',
    });
  }

  const db = useDb();

  // Verify user owns this session before deleting
  const session = await db.query.chatSessions.findFirst({
    where: and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id)),
  });

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found',
    });
  }

  // Delete messages first, then the session
  await db.delete(messages).where(eq(messages.chatSessionId, sessionId));
  await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));

  return { success: true };
});
