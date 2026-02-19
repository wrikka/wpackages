import { chatSessions } from '@aichat/db';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import { requireAuth, requireOrg, useDb } from '../../../composables';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required' });
  }

  const db = useDb();

  const session = await db.query.chatSessions.findFirst({
    where: and(
      eq(chatSessions.id, sessionId),
      eq(chatSessions.organizationId, org.id),
      eq(chatSessions.userId, user.id),
    ),
  });

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' });
  }

  let shareId = session.shareId;
  if (!shareId) {
    shareId = generateId(10);
    await db.update(chatSessions).set({ shareId }).where(eq(chatSessions.id, sessionId));
  }

  return { shareId };
});
