import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeExplanations, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const explain = (language: string, code: string) => {
  const keyPoints = [
    'Identify inputs and outputs',
    'Note important branches/loops',
    'Watch for side effects',
  ];

  return {
    explanation:
      `This is a mock explanation for ${language}. The snippet appears to implement logic with ${
        code.split('\n').length
      } line(s).`,
    keyPoints,
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, language, code } = body as {
    conversationId?: string;
    language?: string;
    code?: string;
  };

  if (!conversationId || !language || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId, language, and code are required',
    });
  }

  const { explanation, keyPoints } = explain(language, code);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/explain-code\n\`\`\`\n${code}\n\`\`\``),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    language,
    code,
    explanation,
    keyPoints,
    createdAt: new Date(),
  };

  await db.insert(codeExplanations).values(row);

  const summaryContent = {
    type: 'code_explanation_summary',
    language,
    explanation,
    keyPoints,
    code,
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
