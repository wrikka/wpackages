import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { gitCommandSuggestions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock git command suggester
const suggestGitCommand = (scenario: string) => {
  const lowerScenario = scenario.toLowerCase();
  if (lowerScenario.includes('undo last commit')) {
    return {
      command: 'git reset HEAD~1',
      explanation:
        'This command moves the current branch back by one commit, effectively undoing the last commit. The changes from that commit are kept in your working directory.',
    };
  } else if (lowerScenario.includes('rename a branch')) {
    return {
      command: 'git branch -m <new-name>',
      explanation: 'This command renames the current local branch to the new name you provide.',
    };
  } else if (lowerScenario.includes('discard changes')) {
    return {
      command: 'git checkout -- <file>',
      explanation:
        'This command discards all changes made to the specified file in your working directory, reverting it to the version from the last commit.',
    };
  } else {
    return {
      command: 'git log --oneline --graph --decorate',
      explanation:
        'This is a useful command to view the commit history as a graph, showing branches and merges clearly in a compact format.',
    };
  }
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, scenario } = body;

  if (!conversationId || !scenario) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and scenario are required',
    });
  }

  const suggestion = suggestGitCommand(scenario);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/git ${scenario}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the suggestion
  const newSuggestion = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    scenario,
    ...suggestion,
    createdAt: new Date(),
  };
  await db.insert(gitCommandSuggestions).values(newSuggestion);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'git_command_summary',
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
