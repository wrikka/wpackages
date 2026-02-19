import { and, eq, inArray } from 'drizzle-orm';
import { generateId } from 'lucia';
import { z } from 'zod';

import { chatSessions, messageAttachments, messageMentions, messages, users } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../../composables';

const NEW_MESSAGE_ID_LENGTH = 15;

const bodySchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().optional(),
  parentMessageId: z.string().optional(),
  tool_calls: z.any().optional(),
  tool_results: z.any().optional(),
  mentions: z.array(z.string()).optional(),
  attachmentIds: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required' });
  }

  const body = await readValidatedBody(event, bodySchema.parse);

  const db = await useDb();

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

  const newMessage = {
    chatSessionId: sessionId,
    content: body.content,
    id: generateId(NEW_MESSAGE_ID_LENGTH),
    parentMessageId: body.parentMessageId,
    role: body.role,
    timestamp: new Date(),
    tool_calls: body.tool_calls ?? null,
    tool_results: body.tool_results ?? null,
  };

  await db.insert(messages).values(newMessage);

  // Handle Mentions
  if (body.mentions?.length) {
    const mentionedUsers = await db.query.users.findMany({
      columns: { id: true },
      where: inArray(users.username, body.mentions),
    });

    if (mentionedUsers.length) {
      const mentionValues = mentionedUsers.map(u => ({ messageId: newMessage.id, userId: u.id }));
      await db.insert(messageMentions).values(mentionValues);
    }
  }

  // Handle Attachments
  if (body.attachmentIds?.length) {
    const attachmentValues = body.attachmentIds.map((attachmentId: string) => ({
      attachmentId,
      messageId: newMessage.id,
    }));
    await db.insert(messageAttachments).values(attachmentValues);
  }

  await db.update(chatSessions).set({ updatedAt: new Date() }).where(
    eq(chatSessions.id, sessionId),
  );

  return newMessage;
});
