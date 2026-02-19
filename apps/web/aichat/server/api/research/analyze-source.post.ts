import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, researchSources } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock analysis function
const analyzeSource = (url: string) => {
  let credibilityScore = 75;
  let biasAnalysis = 'Appears to be a neutral, fact-based source.';

  if (url.includes('wikipedia.org')) {
    credibilityScore = 85;
    biasAnalysis =
      'Generally reliable and community-moderated, but can be subject to vandalism or slow updates on niche topics.';
  } else if (url.includes('blogspot.com') || url.includes('wordpress.com')) {
    credibilityScore = 40;
    biasAnalysis =
      'This is a personal blog. Information should be cross-verified with more established sources. May contain strong personal opinions.';
  } else if (url.includes('.gov') || url.includes('.edu')) {
    credibilityScore = 90;
    biasAnalysis =
      'Government or educational institution source, typically reliable for factual data and research.';
  }

  return { credibilityScore, biasAnalysis };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, sourceId } = body;

  if (!conversationId || !sourceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and Source ID are required',
    });
  }

  const source = await db.query.researchSources.findFirst({
    where: eq(researchSources.id, sourceId),
  });

  if (!source) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Source not found',
    });
  }

  const { credibilityScore, biasAnalysis } = analyzeSource(source.url);

  // Update the source record in the database
  await db.update(researchSources)
    .set({ credibilityScore, biasAnalysis })
    .where(eq(researchSources.id, sourceId));

  // Create a summary message for the chat
  const summaryContent = {
    type: 'source_analysis_summary',
    sourceId,
    title: source.title,
    url: source.url,
    credibilityScore,
    biasAnalysis,
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
