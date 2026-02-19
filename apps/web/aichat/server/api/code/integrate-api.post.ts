import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { apiIntegrations, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock API integration code generator
const generateApiCode = (apiName: string) => {
  const upperApiName = apiName.charAt(0).toUpperCase() + apiName.slice(1);
  const clientCode = `
// lib/api/${apiName.toLowerCase()}.ts
import { ${upperApiName}Client } from '@${apiName.toLowerCase()}/sdk';

export const ${apiName.toLowerCase()}Api = new ${upperApiName}Client({
  apiKey: process.env.${upperApiName.toUpperCase()}_API_KEY,
});
  `.trim();

  const usageExample = `
// services/paymentService.ts
import { ${apiName.toLowerCase()}Api } from '~/lib/api/${apiName.toLowerCase()}';

async function processPayment(amount: number, currency: string) {
  try {
    const response = await ${apiName.toLowerCase()}Api.charges.create({
      amount,
      currency,
      source: 'tok_visa',
    });
    console.log('Payment successful:', response.id);
    return response;
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
  `.trim();

  return { clientCode, usageExample };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, apiName } = body;

  if (!conversationId || !apiName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and API name are required',
    });
  }

  const { clientCode, usageExample } = generateApiCode(apiName);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/integrate ${apiName}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the integration code
  const newIntegration = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    apiName,
    clientCode,
    usageExample,
    createdAt: new Date(),
  };
  await db.insert(apiIntegrations).values(newIntegration);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'api_integration_summary',
    ...newIntegration,
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
