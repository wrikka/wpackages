import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { followUpQuestions, messages } from '~/server/database/schema';
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

  // Mock generating follow-up questions
  const mockQuestions = [
    `What are the ethical implications of ${topic}?`,
    `How has ${topic} evolved over the last decade?`,
    `Who are the key contributors to the field of ${topic}?`,
  ];

  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/suggest-questions ${topic}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the questions
  const newFollowUp = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    questions: JSON.stringify(mockQuestions),
    createdAt: new Date(),
  };
  await db.insert(followUpQuestions).values(newFollowUp);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'follow_up_questions_summary',
    topic,
    questions: mockQuestions,
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
