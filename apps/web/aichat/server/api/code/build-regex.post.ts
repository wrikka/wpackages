import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, regexSuggestions } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock regex builder function
const buildRegex = (description: string) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('email')) {
    return {
      regex: '/^[w-.]+@([w-]+.)+[w-]{2,4}$/g',
      explanation:
        'This regex matches a standard email format. It looks for characters, followed by an @ sign, then a domain name.',
    };
  } else if (lowerDesc.includes('url')) {
    return {
      regex:
        '/https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g',
      explanation:
        'This regex matches HTTP and HTTPS URLs, with an optional www subdomain and various allowed characters in the path and query string.',
    };
  } else {
    return {
      regex: '/\b' + description.replace(/s/g, '\\s+') + '\b/gi',
      explanation:
        'This is a simple case-insensitive regex that looks for the exact phrase you described, bounded by word breaks.',
    };
  }
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, description } = body;

  if (!conversationId || !description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and description are required',
    });
  }

  const regexData = buildRegex(description);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/regex ${description}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the suggestion
  const newSuggestion = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    description,
    ...regexData,
    createdAt: new Date(),
  };
  await db.insert(regexSuggestions).values(newSuggestion);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'regex_builder_summary',
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
