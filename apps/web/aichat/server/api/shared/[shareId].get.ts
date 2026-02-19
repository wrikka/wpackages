import { eq } from 'drizzle-orm';

import { useDb } from '../../composables';
import { chatSessions } from '../../db';
export default defineEventHandler(async (event) => {
  const shareId = getRouterParam(event, 'shareId');
  if (!shareId) {
    throw createError({ statusCode: 400, statusMessage: 'Share ID is required' });
  }

  const db = useDb();

  const session = await db.query.chatSessions.findFirst({
    where: eq(chatSessions.shareId, shareId),
    with: {
      messages: {
        orderBy: (messages: any, operators: any) => [operators.asc(messages.timestamp)],
      },
    },
  });

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Shared session not found' });
  }

  // Omit user-specific data
  const { userId: _userId, ...publicSession } = session;

  return publicSession;
});
