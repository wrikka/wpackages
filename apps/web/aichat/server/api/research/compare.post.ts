import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { comparativeAnalyses, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock comparative analysis function
const compareItems = (items: string[]) => {
  const features = [
    { name: 'Performance', values: ['High', 'Medium', 'High'] },
    { name: 'Ease of Use', values: ['Easy', 'Easy', 'Moderate'] },
    { name: 'Cost', values: ['Free', 'Paid', 'Free'] },
    { name: 'Community Support', values: ['Large', 'Medium', 'Large'] },
  ];
  const summary = `Based on the comparison, ${items[0]} and ${
    items[2]
  } are strong contenders in terms of performance and community support, with the main differentiator being ease of use. ${
    items[1]
  } offers a balanced profile but comes at a cost.`;

  return { features, summary };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, items } = body;

  if (!conversationId || !items || !Array.isArray(items) || items.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and an array of at least two items to compare are required',
    });
  }

  const analysisData = compareItems(items);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/compare ${items.join(' vs ')}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the analysis
  const newAnalysis = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    items: JSON.stringify(items),
    features: JSON.stringify(analysisData.features),
    summary: analysisData.summary,
    createdAt: new Date(),
  };
  await db.insert(comparativeAnalyses).values(newAnalysis);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'comparative_analysis_summary',
    items,
    ...analysisData,
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
