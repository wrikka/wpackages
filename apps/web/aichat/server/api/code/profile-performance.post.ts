import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeSnippets, messages, performanceReports } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock analysis function
const profileCode = (code: string) => {
  let bottleneck = 'Unknown';
  let suggestion = 'General best practices should be applied.';
  let optimizedCode = `// No specific optimization found.\n${code}`;

  if (code.includes('for (let i = 0; i < arr.length; i++)')) {
    bottleneck = 'Inefficient Loop';
    suggestion =
      'Consider using a `for...of` loop or functional methods like `forEach` for better readability and potential performance gains in some JavaScript engines.';
    optimizedCode = code.replace('for (let i = 0; i < arr.length; i++)', 'for (const item of arr)');
  } else if (code.includes('.push(') && code.includes('for')) {
    bottleneck = 'Potential High Memory Usage';
    suggestion =
      'If the array grows very large within a loop, it could lead to high memory consumption. Consider processing items in chunks or using streams if applicable.';
    optimizedCode = `// Suggestion: Process in chunks if data is large\n${code}`;
  }

  return { bottleneck, suggestion, optimizedCode };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, snippetId } = body;

  if (!conversationId || !snippetId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and Snippet ID are required',
    });
  }

  const snippet = await db.query.codeSnippets.findFirst({ where: eq(codeSnippets.id, snippetId) });

  if (!snippet) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Code snippet not found',
    });
  }

  const reportData = profileCode(snippet.code);

  // 1. Save the performance report
  const newReport = {
    id: uuidv4(),
    snippetId,
    ...reportData,
    createdAt: new Date(),
  };
  await db.insert(performanceReports).values(newReport);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'performance_report_summary',
    snippetId,
    ...reportData,
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
