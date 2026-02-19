import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeSnippets, messages, testCases } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// A simple function to get a mock test case based on language
const getMockTestCase = (language: string, functionName: string) => {
  const formattedFunctionName = functionName || 'myFunction';
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      return `
import { ${formattedFunctionName} } from './source';

describe('${formattedFunctionName}', () => {
  it('should handle a basic case', () => {
    expect(${formattedFunctionName}(2, 2)).toBe(4);
  });

  it('should handle a zero case', () => {
    expect(${formattedFunctionName}(5, 0)).toBe(5);
  });
});
      `.trim();
    default:
      return `// Mock test case for ${language}\nassert function_exists('${formattedFunctionName}')`;
  }
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

  // 1. Find the original code snippet
  const snippet = await db.query.codeSnippets.findFirst({ where: eq(codeSnippets.id, snippetId) });

  if (!snippet) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Code snippet not found',
    });
  }

  // 2. Simulate test case generation
  // Simple regex to find a function name for the mock test
  const funcNameMatch = snippet.code.match(/function\s+([\w$]+)\s*\(/);
  const functionName = funcNameMatch ? funcNameMatch[1] : 'unnamedFunction';

  const mockTest = {
    id: uuidv4(),
    snippetId,
    framework: 'vitest', // Mocking vitest as the framework
    code: getMockTestCase(snippet.language, functionName),
    createdAt: new Date(),
  };
  await db.insert(testCases).values(mockTest);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'test_cases_summary',
    snippetId,
    framework: mockTest.framework,
    code: mockTest.code,
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
