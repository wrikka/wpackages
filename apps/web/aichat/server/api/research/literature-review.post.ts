import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { literatureReviews, messages, researchTopics } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock literature review function
const findPapers = (topic: string) => {
  return [
    {
      paperTitle: `Foundational Theories of ${topic}`,
      authors: ['J. Doe', 'A. Smith'],
      publicationYear: 2005,
      summary:
        'This seminal paper outlines the core principles and theoretical underpinnings that have shaped the study of this topic.',
      sourceUrl: 'https://example.com/paper1',
    },
    {
      paperTitle: `Modern Applications and Case Studies in ${topic}`,
      authors: ['L. Johnson', 'M. Williams'],
      publicationYear: 2018,
      summary:
        'A comprehensive review of recent applications, presenting several case studies that demonstrate practical implementations and outcomes.',
      sourceUrl: 'https://example.com/paper2',
    },
    {
      paperTitle: `Future Directions and Challenges for ${topic}`,
      authors: ['P. Brown'],
      publicationYear: 2023,
      summary:
        'This paper discusses the current challenges and speculates on future research directions, highlighting potential areas for innovation.',
      sourceUrl: 'https://example.com/paper3',
    },
  ];
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

  const papers = findPapers(topic);

  // 2. Save the literature review entries
  const newReviews = papers.map(p => ({
    id: uuidv4(),
    topicId: topicRecord!.id,
    ...p,
    authors: JSON.stringify(p.authors),
    createdAt: new Date(),
  }));
  await db.insert(literatureReviews).values(newReviews);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'literature_review_summary',
    topic,
    papers: newReviews.map(p => ({ ...p, authors: JSON.parse(p.authors) })),
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
