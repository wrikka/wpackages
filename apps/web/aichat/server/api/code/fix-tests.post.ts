import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, testFixSuggestions } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const analyzeFailure = (failingOutput: string) => {
  const lower = failingOutput.toLowerCase();
  if (lower.includes('timeout')) {
    return {
      suspectedCause: 'Test timeout due to async operation or slow environment',
      suggestedFixes: [
        'Increase test timeout for the specific test',
        'Mock slow dependencies (network, timers)',
        'Ensure awaited promises resolve',
      ],
    };
  }

  if (lower.includes('expected') && lower.includes('received')) {
    return {
      suspectedCause: 'Assertion mismatch (expected vs received) caused by behavior change',
      suggestedFixes: [
        'Update snapshots/expected values if behavior change is correct',
        'Add deterministic ordering to collections',
        'Use toMatchObject for partial matches',
      ],
    };
  }

  return {
    suspectedCause: 'Unknown failure',
    suggestedFixes: [
      'Share full failing output and related test file for more accurate suggestions.',
    ],
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, failingOutput } = body as {
    conversationId?: string;
    failingOutput?: string;
  };

  if (!conversationId || !failingOutput) {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId and failingOutput are required',
    });
  }

  const { suspectedCause, suggestedFixes } = analyzeFailure(failingOutput);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/fix-tests\n\`\`\`\n${failingOutput}\n\`\`\``),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    failingOutput,
    suspectedCause,
    suggestedFixes,
    createdAt: new Date(),
  };

  await db.insert(testFixSuggestions).values(row);

  const summaryContent = { type: 'test_fix_summary', suspectedCause, suggestedFixes };

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
