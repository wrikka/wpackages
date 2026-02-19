import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { codeSnippets, generatedDocs, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock documentation generator
const generateMarkdownDocs = (code: string, language: string) => {
  const funcNameMatch = code.match(/(?:function|const|let|var)\s+([\w$]+)\s*=\s*(?:async)?\s*\(/);
  const functionName = funcNameMatch ? funcNameMatch[1] : 'unnamedFunction';

  const paramsMatch = code.match(/\(([^)]*)\)/);
  const params = paramsMatch ? paramsMatch[1].split(',').map(p => p.trim()).filter(Boolean) : [];

  let docs = `## Documentation for \`${functionName}\`\n\n`;
  docs += `This document provides an overview of the \`${functionName}\` function.\n\n`;
  docs +=
    `### Description\n\n(AI-generated description of what the function likely does based on its name and parameters.)\n\n`;
  docs += `### Parameters\n\n`;
  if (params.length > 0) {
    params.forEach(param => {
      docs += `- \`${param}\`: (Type) - (Description of the parameter.)\n`;
    });
  } else {
    docs += 'This function takes no parameters.\n';
  }
  docs += `\n### Returns\n\n- (Return Type) - (Description of the return value.)\n\n`;
  docs +=
    `### Example Usage\n\n\`\`\`${language}\n// Example of how to use the function\n${functionName}(${
      params.map(() => '...').join(', ')
    });\n\`\`\`\n`;

  return docs;
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

  const docContent = generateMarkdownDocs(snippet.code, snippet.language);

  // 1. Save the generated documentation
  const newDoc = {
    id: uuidv4(),
    snippetId,
    format: 'markdown',
    content: docContent,
    createdAt: new Date(),
  };
  await db.insert(generatedDocs).values(newDoc);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'generated_docs_summary',
    snippetId,
    format: newDoc.format,
    content: newDoc.content,
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
