import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, researchTopics, trendAnalyses } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock trend analysis function
const analyzeTrends = (topic: string) => {
  const trends = ['Increasing', 'Decreasing', 'Stable'];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  let forecast = 'The current trend is expected to continue for the next 1-2 years.';
  if (trend === 'Increasing') {
    forecast =
      'Rapid adoption is expected to continue, potentially reaching market saturation in the next 3-5 years.';
  }
  const confidence = Math.floor(Math.random() * (95 - 70 + 1) + 70); // Random confidence between 70-95%

  return { trend, forecast, confidence };
};

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

  const trendData = analyzeTrends(topic);

  // 2. Save the trend analysis
  const newAnalysis = {
    id: uuidv4(),
    topicId: topicRecord.id,
    ...trendData,
    createdAt: new Date(),
  };
  await db.insert(trendAnalyses).values(newAnalysis);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'trend_analysis_summary',
    topic,
    ...trendData,
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
