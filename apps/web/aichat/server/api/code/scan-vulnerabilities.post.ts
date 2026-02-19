import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, securityVulnerabilities } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock vulnerability scanner
const scanCode = (code: string) => {
  const vulnerabilities = [];
  if (code.includes('dangerouslySetInnerHTML')) {
    vulnerabilities.push({
      vulnerabilityType: 'Cross-Site Scripting (XSS)',
      severity: 'High',
      description:
        'The use of dangerouslySetInnerHTML can open your application to XSS attacks if the content is not properly sanitized.',
      remediation:
        'Avoid using dangerouslySetInnerHTML. If necessary, use a library like DOMPurify to sanitize the HTML before rendering.',
      codeSnippet: code.match(/.*dangerouslySetInnerHTML.*/g)?.[0] || '',
    });
  }
  if (code.match(/SELECT .* FROM .* WHERE id = \$\{/)) {
    vulnerabilities.push({
      vulnerabilityType: 'SQL Injection',
      severity: 'High',
      description:
        'Directly interpolating user input into SQL queries can lead to SQL injection vulnerabilities.',
      remediation: 'Use parameterized queries or a trusted ORM to handle database interactions.',
      codeSnippet: code.match(/.*SELECT .* FROM .* WHERE id = \$\{.*/g)?.[0] || '',
    });
  }
  return vulnerabilities;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, code } = body;

  if (!conversationId || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and code to scan are required',
    });
  }

  const foundVulnerabilities = scanCode(code);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/scan-security\n\`\`\`\n${code}\n\`\`\``),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the vulnerabilities
  if (foundVulnerabilities.length > 0) {
    const newVulnerabilities = foundVulnerabilities.map(v => ({
      id: uuidv4(),
      messageId: userMessage ? userMessage.id : '',
      ...v,
      createdAt: new Date(),
    }));
    await db.insert(securityVulnerabilities).values(newVulnerabilities);
  }

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'security_scan_summary',
    vulnerabilities: foundVulnerabilities,
    codeScanned: code,
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
