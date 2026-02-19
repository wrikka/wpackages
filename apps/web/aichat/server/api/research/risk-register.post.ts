import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, riskRegisters } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const buildRisks = (context: string) => {
  const risks = [
    {
      id: 'risk-1',
      risk: 'Scope creep',
      likelihood: 'medium',
      impact: 'high',
      mitigation: 'Define acceptance criteria and change control.',
    },
    {
      id: 'risk-2',
      risk: 'Security misconfiguration',
      likelihood: 'medium',
      impact: 'high',
      mitigation: 'Use secure defaults and run periodic audits.',
    },
  ];

  if (context.toLowerCase().includes('payment')) {
    risks.push({
      id: 'risk-3',
      risk: 'PCI compliance gaps',
      likelihood: 'low',
      impact: 'high',
      mitigation: 'Use a PCI-compliant provider and reduce card data scope.',
    });
  }

  return risks;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, context } = body as { conversationId?: string; context?: string };

  if (!conversationId || !context) {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId and context are required',
    });
  }

  const risks = buildRisks(context);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/risk-register ${context}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    context,
    risks,
    createdAt: new Date(),
  };

  await db.insert(riskRegisters).values(row);

  const summaryContent = { type: 'risk_register_summary', context, risks };

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
