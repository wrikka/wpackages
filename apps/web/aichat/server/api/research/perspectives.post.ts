import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, researchPerspectives, researchTopics } from '~/server/database/schema';
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
      status: 'in_progress' as const,
      createdAt: new Date(),
    };
    await db.insert(researchTopics).values(topicRecord);
  }

  // 2. Simulate finding different perspectives
  const mockPerspectives = [
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      stance: 'for' as const,
      title: `Arguments for ${topic}`,
      summary:
        'This perspective highlights the key benefits and positive impacts, often citing economic growth and technological advancement.',
      sourceUrl: 'https://example.com/for-topic',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      stance: 'against' as const,
      title: `Arguments against ${topic}`,
      summary:
        'This viewpoint focuses on the potential drawbacks, ethical concerns, and societal risks associated with the topic.',
      sourceUrl: 'https://example.com/against-topic',
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: topicRecord.id,
      stance: 'neutral' as const,
      title: `A Neutral Stance on ${topic}`,
      summary:
        'Providing a balanced overview, this perspective presents factual information without taking a strong position, weighing both pros and cons.',
      sourceUrl: 'https://example.com/neutral-topic',
      createdAt: new Date(),
    },
  ];
  await db.insert(researchPerspectives).values(mockPerspectives);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'perspective_summary',
    topic: topicRecord.topic,
    perspectives: mockPerspectives.map(p => ({
      stance: p.stance,
      title: p.title,
      summary: p.summary,
      sourceUrl: p.sourceUrl,
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
