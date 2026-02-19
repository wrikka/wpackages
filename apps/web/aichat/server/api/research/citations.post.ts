import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { citations, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const generateCitations = (text: string, style: string) => {
  const base = [
    {
      title: 'Example Source',
      author: 'Doe, J.',
      year: 2020,
      url: 'https://example.com',
      citation: style.toLowerCase() === 'apa'
        ? 'Doe, J. (2020). Example Source. https://example.com'
        : 'Doe, J. Example Source. 2020. https://example.com',
    },
  ];

  return base;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, text, style } = body as {
    conversationId?: string;
    text?: string;
    style?: string;
  };

  if (!conversationId || !text) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId and text are required' });
  }

  const resolvedStyle = style?.trim() ? style.trim() : 'APA';
  const list = generateCitations(text, resolvedStyle);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/citations ${text}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    text,
    style: resolvedStyle,
    citations: list,
    createdAt: new Date(),
  };

  await db.insert(citations).values(row);

  const summaryContent = { type: 'citations_summary', style: resolvedStyle, citations: list };

  const assistantMessage = {
    id: uuidv4(),
    conversationId,
    role: 'assistant' as const,
    content: JSON.stringify(summaryContent),
    createdAt: new Date(),
  };

  await db.insert(messages).values(assistantMessage);

  return assistantMessage;
});
