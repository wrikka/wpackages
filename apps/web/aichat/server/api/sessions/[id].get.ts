import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { chatSessions, messages } from '../../db';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required',
    });
  }

  const db = useDb();

  // Verify user owns this session
  const session = await db.query.chatSessions.findFirst({
    where: and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id)),
  });

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found',
    });
  }

  const messageList = await db.query.messages.findMany({
    where: eq(messages.chatSessionId, sessionId),
    orderBy: (messages, { asc }) => [asc(messages.timestamp)],
  });

  return messageList;
});
