import { createError, defineEventHandler, getHeader, getMethod, readBody, setHeader } from 'h3';
import { OpenAI } from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { conversations, messages, users } from '~/server/database/schema';
import { db } from '~/server/utils/db';

function setCors(event: any) {
  const origin = getHeader(event, 'origin') || '*';
  setHeader(event, 'access-control-allow-origin', origin);
  setHeader(event, 'access-control-allow-methods', 'POST, OPTIONS');
  setHeader(event, 'access-control-allow-headers', 'content-type, x-extension-token');
  setHeader(event, 'access-control-max-age', '86400');
}

async function ensureUser(userId: string) {
  const existing = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.id, userId),
  });

  if (existing) return;

  await db.insert(users).values({
    id: userId,
    username: 'browser-extension',
    createdAt: new Date(),
  });
}

async function createConversation(userId: string) {
  const conversationId = uuidv4();
  await db.insert(conversations).values({
    id: conversationId,
    userId,
    title: 'Browser Extension',
    systemPrompt: null,
    createdAt: new Date(),
  });
  return conversationId;
}

async function generateAssistantReply(input: { message: string; model?: string }) {
  const config = useRuntimeConfig();
  if (!config.openaiApiKey) {
    return 'AI provider is not configured on the server.';
  }

  const openai = new OpenAI({ apiKey: config.openaiApiKey });
  const completion = await openai.chat.completions.create({
    model: input.model && input.model.trim().length > 0 ? input.model : 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: input.message }],
  });

  return completion.choices[0]?.message?.content || 'No response.';
}

export default defineEventHandler(async (event) => {
  setCors(event);

  if (getMethod(event) === 'OPTIONS') {
    return '';
  }

  const config = useRuntimeConfig();
  const serverToken = config.extensionToken;
  if (serverToken && serverToken.trim().length > 0) {
    const token = getHeader(event, 'x-extension-token');
    if (!token || token !== serverToken) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
  }

  const body = await readBody(event);
  const { message, conversationId, model } = body as {
    message?: string;
    conversationId?: string;
    model?: string;
  };

  if (!message || message.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'message is required' });
  }

  const userId = event.context.user?.id || 'browser-extension';
  await ensureUser(userId);

  const cid = conversationId && conversationId.trim().length > 0
    ? conversationId
    : await createConversation(userId);

  const userMessageId = uuidv4();
  await db.insert(messages).values({
    id: userMessageId,
    conversationId: cid,
    role: 'user',
    content: message,
    createdAt: new Date(),
  });

  const assistantText = await generateAssistantReply({ message, model });

  const assistantMessageId = uuidv4();
  await db.insert(messages).values({
    id: assistantMessageId,
    conversationId: cid,
    role: 'assistant',
    content: assistantText,
    createdAt: new Date(),
  });

  return {
    success: true,
    conversationId: cid,
    message: {
      id: assistantMessageId,
      role: 'assistant',
      content: assistantText,
    },
  };
});
