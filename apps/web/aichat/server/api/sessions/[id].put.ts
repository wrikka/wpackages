import { chatSessions } from '@aichat/db';
import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required',
    });
  }

  const body = await readBody(event);
  const { title, systemPrompt, folderId, model, knowledgeBaseId, pinned, tags } = body;

  if (
    title === undefined && systemPrompt === undefined && folderId === undefined
    && model === undefined && knowledgeBaseId === undefined && pinned === undefined
    && tags === undefined
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title or systemPrompt is required',
    });
  }

  const db = useDb();

  // Verify user owns this session
  const session = await db.query.chatSessions.findFirst({
    where: and(
      eq(chatSessions.id, sessionId),
      eq(chatSessions.organizationId, org.id),
      eq(chatSessions.userId, user.id),
    ),
  });

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found',
    });
  }

  const dataToUpdate: {
    title?: string;
    systemPrompt?: string | null;
    folderId?: string | null;
    model?: string;
    knowledgeBaseId?: string | null;
    pinned?: number;
    tags?: unknown;
    updatedAt: Date;
  } = { updatedAt: new Date() };
  if (title) {
    dataToUpdate.title = title;
  }
  if (systemPrompt !== undefined) {
    dataToUpdate.systemPrompt = systemPrompt;
  }
  if (folderId !== undefined) {
    dataToUpdate.folderId = folderId;
  }
  if (model !== undefined) {
    dataToUpdate.model = model;
  }
  if (knowledgeBaseId !== undefined) {
    dataToUpdate.knowledgeBaseId = knowledgeBaseId;
  }
  if (pinned !== undefined) {
    dataToUpdate.pinned = pinned ? 1 : 0;
  }
  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      dataToUpdate.tags = tags;
    } else if (typeof tags === 'string') {
      const parts = tags
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      dataToUpdate.tags = parts;
    } else {
      dataToUpdate.tags = [];
    }
  }

  await db.update(chatSessions).set(dataToUpdate).where(eq(chatSessions.id, sessionId));

  return { success: true };
});
