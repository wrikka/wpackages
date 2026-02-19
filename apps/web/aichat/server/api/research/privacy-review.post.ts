import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, privacyReviews } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const reviewPrivacy = (content: string) => {
  const findings = [] as Array<
    { title: string; severity: 'low' | 'medium' | 'high'; details: string }
  >;

  const lower = content.toLowerCase();
  if (lower.includes('email') || lower.includes('phone')) {
    findings.push({
      title: 'Collects personal identifiers',
      severity: 'medium',
      details: 'The content appears to include collection of direct identifiers (email/phone).',
    });
  }

  if (lower.includes('share with') || lower.includes('third party')) {
    findings.push({
      title: 'Third-party data sharing',
      severity: 'high',
      details:
        'The content suggests data may be shared with third parties. Ensure explicit disclosure and consent.',
    });
  }

  const recommendations = [
    'Add a clear data retention policy',
    'Provide opt-out where applicable',
    'Document lawful basis for processing',
  ];

  return { findings, recommendations };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, content } = body as { conversationId?: string; content?: string };

  if (!conversationId || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId and content are required',
    });
  }

  const { findings, recommendations } = reviewPrivacy(content);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/privacy-review ${content}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    content,
    findings,
    recommendations,
    createdAt: new Date(),
  };

  await db.insert(privacyReviews).values(row);

  const summaryContent = {
    type: 'privacy_review_summary',
    findings,
    recommendations,
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
