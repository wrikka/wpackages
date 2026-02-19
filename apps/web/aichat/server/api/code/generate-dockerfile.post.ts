import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { dockerfileGenerations, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const genDockerfile = (appType: string) => {
  if (appType.toLowerCase().includes('node')) {
    return {
      dockerfile: [
        'FROM node:20-alpine',
        'WORKDIR /app',
        'COPY package.json package-lock.json* ./',
        'RUN npm ci',
        'COPY . .',
        'CMD ["npm","run","start"]',
      ].join('\n'),
      notes: ['Consider using multi-stage build for smaller images.'],
    };
  }

  return {
    dockerfile: [
      'FROM alpine:3.19',
      'WORKDIR /app',
      'COPY . .',
      'CMD ["sh"]',
    ].join('\n'),
    notes: ['Provide explicit runtime requirements for better results.'],
  };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, appType, requirements } = body as {
    conversationId?: string;
    appType?: string;
    requirements?: unknown;
  };

  if (!conversationId || !appType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId and appType are required',
    });
  }

  const { dockerfile, notes } = genDockerfile(appType);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/generate-dockerfile ${appType}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    appType,
    requirements: requirements ?? [],
    dockerfile,
    notes,
    createdAt: new Date(),
  };

  await db.insert(dockerfileGenerations).values(row);

  const summaryContent = { type: 'dockerfile_summary', appType, dockerfile, notes };

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
