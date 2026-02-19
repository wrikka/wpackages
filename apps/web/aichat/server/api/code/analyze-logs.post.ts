import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { logAnalyses, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const analyzeLogs = (logs: string) => {
  const rootCauses: string[] = [];
  const actions: string[] = [];

  const lower = logs.toLowerCase();
  if (lower.includes('econnrefused')) {
    rootCauses.push('Service is not reachable (ECONNREFUSED)');
    actions.push('Verify host/port, and ensure service is running');
  }

  if (lower.includes('out of memory') || lower.includes('oom')) {
    rootCauses.push('Memory pressure / OOM');
    actions.push('Check memory limits, reduce payload size, or optimize allocation');
  }

  if (rootCauses.length === 0) {
    rootCauses.push('No obvious signature detected');
    actions.push('Provide more context around the failure window');
  }

  return {
    summary: 'Mock log analysis summary generated.',
    rootCauses,
    actions,
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, logs } = body as { conversationId?: string; logs?: string };

  if (!conversationId || !logs) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId and logs are required' });
  }

  const { summary, rootCauses, actions } = analyzeLogs(logs);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/analyze-logs\n\`\`\`\n${logs}\n\`\`\``),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    logs,
    summary,
    rootCauses,
    actions,
    createdAt: new Date(),
  };

  await db.insert(logAnalyses).values(row);

  const summaryContent = { type: 'log_analysis_summary', summary, rootCauses, actions };

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
