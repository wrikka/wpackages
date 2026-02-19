import { and, desc, eq, inArray } from 'drizzle-orm';
import { getRequestIP } from 'h3';
import { readFile } from 'node:fs/promises';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { callAIStream } from '../services/ai';
import { logger } from '../utils/logger';
import { checkRateLimit } from '../utils/rate-limiter';

import type { Message } from '#shared/types/message';
import type { ChatMode } from '#shared/types/common';
import type { ChatErrorEvent } from '@wai/ai-sdk';
import { requireAuth, requireOrg, useDb } from '../composables';
import { agentTools, attachments, chatSessions, messages as messagesSchema, tools } from '../db';
import { getSystemPromptForMode } from '../services/systemPrompt';

function sseLine(payload: unknown) {
  return new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`);
}

type DbMessage = typeof messagesSchema.$inferSelect;

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  requireOrg(event);

  const ip = getRequestIP(event, { xForwardedFor: true });
  if (ip) {
    await checkRateLimit(`ip:${ip}`);
  }
  await checkRateLimit(`user:${user.id}`);

  const body = await readBody(event);
  const { message, sessionId, attachmentIds, mode, model, provider, systemPrompt } = body as {
    message?: string;
    sessionId?: string;
    attachmentIds?: unknown;
    mode?: ChatMode;
    model?: string;
    provider?: string;
    systemPrompt?: string | null;
  };

  if (!message || !sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Message and sessionId are required' });
  }

  const db = await useDb();
  const session = await db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' });
  }

  const lastMessages = await db.query.messages.findMany({
    where: eq(messagesSchema.chatSessionId, sessionId),
    orderBy: (messages: typeof messagesSchema) => [desc(messages.timestamp)],
    limit: 10, // Get last 10 messages for context
  }) as DbMessage[];

  const history: ChatCompletionMessageParam[] = lastMessages.reverse().map((m) => {
    const role = m.role as 'user' | 'assistant' | 'system';
    if (role === 'assistant') {
      return { role: 'assistant', content: m.content };
    }
    if (role === 'system') {
      return { role: 'system', content: m.content ?? '' };
    }
    return { role: 'user', content: m.content ?? '' };
  });

  // Fetch agent tools if an agent is active
  let agentToolsList: any[] = [];
  if (session.agentId) {
    const dbTools = await db
      .select({
        name: tools.name,
        description: tools.description,
        parameters: tools.parameters,
      })
      .from(agentTools)
      .leftJoin(tools, eq(agentTools.toolId, tools.id))
      .where(eq(agentTools.agentId, session.agentId));

    if (dbTools) {
      agentToolsList = dbTools.map((
        t: { name: string | null; description: string | null; parameters: unknown },
      ) => ({
        type: 'function',
        function: {
          name: t.name!,
          description: t.description!,
          parameters: t.parameters!,
        },
      }));
    }
  }

  let messageWithContext = message;
  const imageAttachments: { fileType: string; dataUrl: string; fileName: string }[] = [];
  if (Array.isArray(attachmentIds) && attachmentIds.length > 0) {
    const attachedFiles = await db.query.attachments.findMany({
      where: and(
        inArray(attachments.id, attachmentIds as string[]),
        eq(attachments.organizationId, event.context.org.id),
        eq(attachments.userId, user.id),
      ),
    });

    for (const file of attachedFiles) {
      if (file.textContent) {
        messageWithContext += `\n\n--- Attached File: ${file.fileName} ---\n${file.textContent}`;
      }
      if (file.fileType.startsWith('image/')) {
        const data = await readFile(file.filePath);
        const b64 = data.toString('base64');
        imageAttachments.push({
          fileType: file.fileType,
          fileName: file.fileName,
          dataUrl: `data:${file.fileType};base64,${b64}`,
        });
      }
    }
  }

  try {
    const validModes = [
      'auto',
      'chat',
      'research',
      'code',
      'agent',
      'image',
      'translate',
      'learn',
      'compare',
      'explain',
      'quiz',
      'summarize',
      'tutor',
      'writer',
      'copywriting',
      'analyze',
      'review',
      'organize',
      'present',
    ] as ChatMode[];
    const requestedMode: ChatMode = mode && validModes.includes(mode) ? mode : 'chat';

    const selectedModel = typeof model === 'string' && model.trim().length > 0
      ? model
      : session.model;
    const systemPromptToUse = typeof systemPrompt === 'string'
      ? systemPrompt
      : session.systemPrompt;
    const systemPromptFinal = getSystemPromptForMode(systemPromptToUse, requestedMode);

    const selectedProvider = typeof provider === 'string' && provider.trim().length > 0
      ? provider
      : session.provider;

    // Update session model/provider if changed
    if (selectedModel !== session.model || selectedProvider !== session.provider) {
      await db.update(chatSessions).set({ model: selectedModel, provider: selectedProvider }).where(
        eq(chatSessions.id, sessionId),
      );
    }

    const stream = await callAIStream({
      sessionId,
      message: messageWithContext,
      provider: selectedProvider,
      model: selectedModel,
      systemPrompt: systemPromptFinal,
      history,
      knowledgeBaseId: session.knowledgeBaseId,
      attachments: imageAttachments,
      tools: agentToolsList.length > 0 ? agentToolsList : undefined,
    });
    return sendStream(event, stream);
  } catch (error) {
    const validModes = [
      'auto',
      'chat',
      'research',
      'code',
      'agent',
      'image',
      'translate',
      'learn',
      'compare',
      'explain',
      'quiz',
      'summarize',
      'tutor',
      'writer',
      'copywriting',
      'analyze',
      'review',
      'organize',
      'present',
    ] as ChatMode[];
    const requestedMode: ChatMode = mode && validModes.includes(mode) ? mode : 'chat';
    const config = useRuntimeConfig();
    const isProviderMisconfigured = !config.openaiApiKey;
    logger.error('AI API error', { error, requestedMode, isProviderMisconfigured });

    if (isProviderMisconfigured) {
      const stream = new ReadableStream({
        start(controller) {
          const payload: ChatErrorEvent = {
            type: 'chat_error',
            sessionId,
            code: 'PROVIDER_NOT_CONFIGURED',
            message: 'AI provider is not configured. Please set OPENAI_API_KEY on the server.',
          };
          controller.enqueue(sseLine(payload));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return sendStream(event, stream);
    }

    throw createError({ statusCode: 500, statusMessage: 'Failed to get response from AI' });
  }
});
