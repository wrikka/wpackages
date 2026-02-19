import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { hypotheses, messages, researchTopics } from '~/server/database/schema';
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

  // 2. Simulate generating a hypothesis
  const mockHypothesis = {
    id: uuidv4(),
    topicId: topicRecord.id,
    hypothesis:
      `Based on current data, it is hypothesized that applying ${topic} will lead to a significant increase in efficiency.`,
    validationApproach:
      'Conduct a controlled A/B test over a period of 3 months, measuring key performance indicators before and after implementation. Statistical analysis will be used to determine significance.',
    createdAt: new Date(),
  };
  await db.insert(hypotheses).values(mockHypothesis);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'hypothesis_summary',
    topic: topicRecord.topic,
    hypothesis: mockHypothesis.hypothesis,
    validationApproach: mockHypothesis.validationApproach,
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
