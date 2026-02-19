import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { commitMessageSuggestions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const suggestCommits = (diff: string) => {
  const normalized = diff.toLowerCase();
  const scope = normalized.includes('fix')
    ? 'fix'
    : normalized.includes('refactor')
    ? 'refactor'
    : 'chore';

  return [
    `${scope}: update implementation`,
    `${scope}: improve reliability`,
    `${scope}: adjust UI and handlers`,
  ];
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, diff } = body as { conversationId?: string; diff?: string };

  if (!conversationId || !diff) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId and diff are required' });
  }

  const suggestions = suggestCommits(diff);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/generate-commit\n\`\`\`\n${diff}\n\`\`\``),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    diff,
    suggestions,
    createdAt: new Date(),
  };

  await db.insert(commitMessageSuggestions).values(row);

  const summaryContent = { type: 'commit_message_summary', suggestions };

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
