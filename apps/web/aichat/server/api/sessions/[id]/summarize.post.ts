import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth, requireOrg, useDb } from '~/server/composables';
import { conversations, messages } from '~/server/database/schema';
import { callAI } from '~/server/services/ai';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);
  const sessionId = getRouterParam(event, 'id');

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required' });
  }

  const db = await useDb();

  const session = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, sessionId),
      eq(conversations.userId, user.id),
      // eq(conversations.organizationId, org.id)
    ),
    with: {
      messages: {
        limit: 4, // Get first few messages for context
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      },
    },
  });

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' });
  }

  if (session.messages.length === 0) {
    return { title: 'New Chat' };
  }

  const summaryPrompt =
    `Summarize the following conversation into a short, descriptive title (5-7 words max). The conversation is:

${session.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  const aiResponse = await callAI({
    model: 'gpt-3.5-turbo', // Use a fast model for summarization
    messages: [{ role: 'user', content: summaryPrompt }],
  });

  const title = aiResponse.choices[0].message.content?.trim().replace(/"/g, '') || 'Untitled Chat';

  await db
    .update(conversations)
    .set({ title })
    .where(eq(conversations.id, sessionId));

  return { title };
});
