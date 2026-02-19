import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeGolfSuggestions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock code golf function
const golfCode = (originalCode: string) => {
  // Simple mock: remove comments and extra whitespace
  const golfedCode = originalCode
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();

  const characterSavings = originalCode.length - golfedCode.length;
  const explanation =
    'Removed all comments and collapsed multiple whitespace characters into single spaces for maximum brevity.';

  return { golfedCode, characterSavings, explanation };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, code } = body;

  if (!conversationId || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and code are required',
    });
  }

  const golfData = golfCode(code);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/code-golf\n\`\`\`\n${code}\n\`\`\``),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the suggestion
  const newSuggestion = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    originalCode: code,
    ...golfData,
    createdAt: new Date(),
  };
  await db.insert(codeGolfSuggestions).values(newSuggestion);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'code_golf_summary',
    ...newSuggestion,
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
