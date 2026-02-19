import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, realTimeUpdates, researchTopics } from '~/server/database/schema';
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

  // 2. Simulate fetching real-time updates
  const mockUpdates = [
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      source: 'News Wire',
      content:
        `Breaking News on ${topic}: A new study reveals significant advancements. Experts are cautiously optimistic.`,
      url: 'https://example.com/news-update',
      timestamp: new Date(),
    },
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      source: 'Social Media Trend',
      content: `The hashtag #${
        topic.replace(/\s+/g, '')
      } is now trending with over 100,000 posts in the last hour.`,
      url: 'https://example.com/social-media-update',
      timestamp: new Date(),
    },
  ];
  await db.insert(realTimeUpdates).values(mockUpdates);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'real_time_summary',
    topic: topicRecord.topic,
    updates: mockUpdates.map(u => ({
      source: u.source,
      content: u.content,
      url: u.url,
      timestamp: u.timestamp,
    })),
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
