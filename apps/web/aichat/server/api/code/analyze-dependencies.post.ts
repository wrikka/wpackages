import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { dependencySuggestions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock analysis function
const analyzeDependencies = (dependencies: Record<string, string>) => {
  const suggestions = [];
  if (dependencies['nuxt'] && dependencies['nuxt'] !== '^4.3.0') {
    suggestions.push({
      packageName: 'nuxt',
      currentVersion: dependencies['nuxt'],
      latestVersion: '^4.3.0',
      suggestion: 'Update available',
      notes:
        'Updating to the latest version is recommended for security and performance improvements.',
    });
  }
  if (dependencies['vue'] && dependencies['vue'] < '3.5.0') {
    suggestions.push({
      packageName: 'vue',
      currentVersion: dependencies['vue'],
      latestVersion: '^3.5.27',
      suggestion: 'Major update required',
      notes: 'Version is significantly outdated. Consider planning a migration.',
    });
  }
  if (dependencies['marked']) {
    suggestions.push({
      packageName: 'marked',
      currentVersion: dependencies['marked'],
      latestVersion: 'N/A',
      suggestion: 'Vulnerability found',
      notes:
        'A mock high-severity vulnerability has been detected in this version. Immediate update or replacement is advised.',
    });
  }
  return suggestions;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, packageJsonContent } = body;

  if (!conversationId || !packageJsonContent) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and package.json content are required',
    });
  }

  let dependencies: Record<string, string> = {};
  try {
    const parsed = JSON.parse(packageJsonContent);
    dependencies = { ...parsed.dependencies, ...parsed.devDependencies };
  } catch (error) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid package.json format' });
  }

  const suggestions = analyzeDependencies(dependencies);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, packageJsonContent),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // Save suggestions to the database
  for (const sug of suggestions) {
    await db.insert(dependencySuggestions).values({
      id: uuidv4(),
      messageId: userMessage ? userMessage.id : '',
      ...sug,
      createdAt: new Date(),
    });
  }

  // Create a summary message for the chat
  const summaryContent = {
    type: 'dependency_report',
    suggestions,
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
