import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, researchTopics, timelineEvents } from '~/server/database/schema';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, topic } = body;

  if (!conversationId || !topic) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and topic are required',
    });
  }

  // 1. Find or create the research topic
  let topicRecord = await db.query.researchTopics.findFirst({
    where: eq(researchTopics.topic, topic),
  });
  if (!topicRecord) {
    topicRecord = {
      id: uuidv4(),
      conversationId,
      topic,
      status: 'completed' as const,
      createdAt: new Date(),
    };
    await db.insert(researchTopics).values(topicRecord);
  }

  // 2. Simulate generating timeline events
  const mockEvents = [
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      year: 1950,
      title: 'Early Concepts',
      description:
        'Initial theoretical work and foundational ideas related to the topic were proposed.',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      year: 1985,
      title: 'Key Breakthrough',
      description: 'A significant discovery or invention that accelerated progress in the field.',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      year: 2010,
      title: 'Modern Applications',
      description:
        'The topic becomes widely adopted and integrated into modern technology and society.',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      year: 2024,
      title: 'Future Outlook',
      description:
        'Current research focuses on expanding capabilities and addressing ethical considerations.',
      createdAt: new Date(),
    },
  ].sort((a, b) => a.year - b.year);

  await db.insert(timelineEvents).values(mockEvents);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'timeline_summary',
    topic: topicRecord.topic,
    events: mockEvents.map(e => ({ year: e.year, title: e.title, description: e.description })),
  };

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
