import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../../../composables';
import { chatSessions, messages } from '../../../../db';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const sessionId = getRouterParam(event, 'sessionId');
  const messageId = getRouterParam(event, 'messageId');

  if (!sessionId || !messageId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID and Message ID are required' });
  }

  const body = await readBody(event);
  const content = body.content;
  if (!content) {
    throw createError({ statusCode: 400, statusMessage: 'Content is required' });
  }

  const db = useDb();

  // Verify user owns the session
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

  const existingMessage = await db.query.messages.findFirst({
    where: and(eq(messages.id, messageId), eq(messages.chatSessionId, sessionId)),
  });

  if (!existingMessage) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' });
  }

  await db.update(messages).set({ content }).where(eq(messages.id, messageId));

  return { success: true };
});
