import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, sqlReviews } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const reviewSql = (sql: string) => {
  const issues: Array<{ title: string; severity: 'low' | 'medium' | 'high'; details: string }> = [];

  if (/select \*/i.test(sql)) {
    issues.push({
      title: 'SELECT *',
      severity: 'medium',
      details:
        'Selecting all columns can increase IO and break when schema changes. Prefer explicit columns.',
    });
  }

  if (/where\s+id\s*=\s*\$\{/i.test(sql)) {
    issues.push({
      title: 'Potential SQL injection',
      severity: 'high',
      details: 'Interpolating variables directly into SQL is unsafe. Use parameters.',
    });
  }

  const improvedSql = sql.replace(/select \*/i, 'SELECT /* TODO: columns */');

  return { issues, improvedSql };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, sql } = body as { conversationId?: string; sql?: string };

  if (!conversationId || !sql) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId and sql are required' });
  }

  const { issues, improvedSql } = reviewSql(sql);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/sql-review\n\`\`\`\n${sql}\n\`\`\``),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    sql,
    issues,
    improvedSql,
    createdAt: new Date(),
  };

  await db.insert(sqlReviews).values(row);

  const summaryContent = { type: 'sql_review_summary', issues, improvedSql, sql };

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
