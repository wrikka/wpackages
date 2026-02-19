import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeSnippets, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, language, code } = body;

  if (!conversationId || !language || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID, language, and code are required',
    });
  }

  // 1. Simulate code refactoring
  const refactoredCode = `// Refactored for clarity and performance\n${
    code.replace(/var/g, 'const')
  }`;
  const explanation = 'Replaced `var` with `const` for better scope management and immutability.';

  // 2. Save the snippet to the database
  const newSnippet = {
    id: uuidv4(),
    language,
    code,
    refactoredCode,
    explanation,
    createdAt: new Date(),
  };
  await db.insert(codeSnippets).values(newSnippet);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'code_refactor',
    snippetId: newSnippet.id,
    language,
    originalCode: code,
    refactoredCode,
    explanation,
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
