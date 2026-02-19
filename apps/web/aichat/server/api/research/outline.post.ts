import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, outlines } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const buildOutline = (topic: string) => {
  const t = topic.trim();
  return [
    { title: `Introduction to ${t}`, bullets: ['Context', 'Why it matters', 'Key terms'] },
    { title: 'Main Ideas', bullets: ['Core concept 1', 'Core concept 2', 'Common misconceptions'] },
    { title: 'Examples', bullets: ['Practical example', 'Edge case example'] },
    { title: 'Conclusion', bullets: ['Summary', 'Next steps'] },
  ];
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, topic } = body as { conversationId?: string; topic?: string };

  if (!conversationId || !topic) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId and topic are required' });
  }

  const outline = buildOutline(topic);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/outline ${topic}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    topic,
    outline,
    createdAt: new Date(),
  };

  await db.insert(outlines).values(row);

  const summaryContent = { type: 'outline_summary', topic, outline };

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
