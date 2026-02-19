import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { factChecks, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const evaluateClaim = (claim: string) => {
  const text = claim.trim();
  if (!text) {
    return {
      verdict: 'Unverified',
      confidence: 0,
      evidence: [],
    };
  }

  const lower = text.toLowerCase();
  if (lower.includes('always') || lower.includes('never')) {
    return {
      verdict: 'Needs context',
      confidence: 55,
      evidence: [
        {
          title: 'Heuristic: Absolute wording often indicates overgeneralization',
          snippet:
            'Claims containing “always/never” are frequently false or misleading without strong evidence.',
          url: null,
        },
      ],
    };
  }

  return {
    verdict: 'Unverified',
    confidence: 40,
    evidence: [
      {
        title: 'No external sources configured',
        snippet:
          'This environment uses a mock fact-checker. Provide sources to validate the claim.',
        url: null,
      },
    ],
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, claim } = body as { conversationId?: string; claim?: string };

  if (!conversationId || !claim) {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId and claim are required',
    });
  }

  const result = evaluateClaim(claim);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/fact-check ${claim}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    claim,
    verdict: result.verdict,
    confidence: result.confidence,
    evidence: result.evidence,
    createdAt: new Date(),
  };

  await db.insert(factChecks).values(row);

  const summaryContent = {
    type: 'fact_check_summary',
    claim,
    verdict: result.verdict,
    confidence: result.confidence,
    evidence: result.evidence,
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
