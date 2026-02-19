import { and, eq, not } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../../composables';
import { chatSessions, messages } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const messageId = getRouterParam(event, 'id');
  if (!messageId) {
    throw createError({ statusCode: 400, statusMessage: 'Message ID is required' });
  }

  const db = await useDb();

  // Verify the message exists and belongs to the user's organization
  const [message] = await db
    .select({ id: messages.id, chatSessionId: messages.chatSessionId, isPinned: messages.isPinned })
    .from(messages)
    .innerJoin(chatSessions, eq(messages.chatSessionId, chatSessions.id))
    .where(and(eq(messages.id, messageId), eq(chatSessions.organizationId, org.id)));

  if (!message) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' });
  }

  // Toggle the isPinned status
  const [updatedMessage] = await db
    .update(messages)
    .set({ isPinned: not(messages.isPinned) })
    .where(eq(messages.id, messageId))
    .returning({ id: messages.id, isPinned: messages.isPinned });

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: updatedMessage.isPinned ? 'message.pin' : 'message.unpin',
    targetId: messageId,
    targetType: 'message',
    details: { chatSessionId: message.chatSessionId },
  });

  return updatedMessage;
});
