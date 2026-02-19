import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { extractedData, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock data extraction function
const extractTableData = (text: string) => {
  // In a real scenario, this would involve complex NLP. Here, we'll just mock it.
  const headers = ['Product', 'Region', 'Sales'];
  const rows = [
    ['Widget A', 'North', '1,500'],
    ['Widget B', 'South', '800'],
    ['Widget C', 'North', '2,200'],
  ];
  return { headers, rows };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, text, title } = body;

  if (!conversationId || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and text to analyze are required',
    });
  }

  const tableData = extractTableData(text);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/extract ${text}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the extracted data
  const newExtractedData = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    dataType: 'table' as const,
    data: JSON.stringify(tableData),
    title: title || 'Extracted Data Table',
    createdAt: new Date(),
  };
  await db.insert(extractedData).values(newExtractedData);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'data_visualization_summary',
    dataType: newExtractedData.dataType,
    data: tableData,
    title: newExtractedData.title,
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
