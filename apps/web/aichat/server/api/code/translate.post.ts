import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeTranslations, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock translation function
const translateCode = (code: string, from: string, to: string) => {
  let translated = `// Translated from ${from} to ${to}\n`;
  if (from === 'python' && to === 'javascript') {
    translated += code.replace(/def /g, 'function ').replace(/:/g, ' {').replace(/\n/g, '\n}');
  } else if (from === 'javascript' && to === 'python') {
    translated += code.replace(/function /g, 'def ').replace(/ {/g, ':').replace(/}/g, '');
  } else {
    translated += `// Mock translation logic for ${from} -> ${to}\n${code}`;
  }
  return translated;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, sourceLanguage, targetLanguage, sourceCode } = body;

  if (!conversationId || !sourceLanguage || !targetLanguage || !sourceCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID, source/target language, and source code are required',
    });
  }

  const translatedCode = translateCode(sourceCode, sourceLanguage, targetLanguage);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) =>
      eq(
        messages.content,
        `/translate ${sourceLanguage} to ${targetLanguage}\n\`\`\`${sourceLanguage}\n${sourceCode}\n\`\`\``,
      ),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the translation
  const newTranslation = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    sourceLanguage,
    targetLanguage,
    sourceCode,
    translatedCode,
    createdAt: new Date(),
  };
  await db.insert(codeTranslations).values(newTranslation);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'code_translation_summary',
    ...newTranslation,
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
