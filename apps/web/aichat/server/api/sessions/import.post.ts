import { generateId } from 'lucia';
import { z } from 'zod';

import { requireOrg, useDb } from '../../composables';
import { chatSessions, messages } from '../../db';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

const importSchema = z.object({
  title: z.string(),
  model: z.string(),
  systemPrompt: z.string().nullable().optional(),
  messages: z.array(messageSchema),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  requireOrg(event);

  const body = await readBody(event);
  const validation = importSchema.safeParse(body);

  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid import file format' });
  }

  const { title, model, systemPrompt, messages: importedMessages } = validation.data;

  const db = useDb();
  const newSessionId = generateId(15);

  await db.transaction(async (tx) => {
    await tx.insert(chatSessions).values({
      id: newSessionId,
      organizationId: event.context.org.id,
      userId: user.id,
      title,
      model,
      systemPrompt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (importedMessages.length > 0) {
      await tx.insert(messages).values(
        importedMessages.map((m: { role: 'user' | 'assistant' | 'system'; content: string }) => ({
          id: generateId(15),
          chatSessionId: newSessionId,
          role: m.role,
          content: m.content,
          timestamp: new Date(),
        })),
      );
    }
  });

  return { success: true, sessionId: newSessionId };
});
