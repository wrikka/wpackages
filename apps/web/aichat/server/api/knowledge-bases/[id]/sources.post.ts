import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { z } from 'zod';
import { requireAuth, useDb } from '../../../composables';
import { knowledgeBases, knowledgeBaseSources } from '../../../db';

const SourceInput = z.object({
  type: z.enum(['url', 'file']),
  uri: z.string().min(1),
  // For file uploads, more data might be passed, like fileName, fileType, etc.
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const kbId = getRouterParam(event, 'id');

  if (!kbId) {
    throw createError({ statusCode: 400, message: 'Knowledge Base ID is required' });
  }

  const body = await readBody(event);
  const validation = SourceInput.safeParse(body);

  if (!validation.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' });
  }

  const { type, uri } = validation.data;
  const db = await useDb();

  // Verify user has access to this KB
  const kb = await db.query.knowledgeBases.findFirst({
    where: and(
      eq(knowledgeBases.id, kbId),
      eq(knowledgeBases.userId, user.id), // Simplified access check
    ),
  });

  if (!kb) {
    throw createError({
      statusCode: 404,
      message: 'Knowledge Base not found or you do not have access',
    });
  }

  // TODO: Handle file uploads properly. For now, we just create the source record.

  const newSource = {
    id: generateId(15),
    knowledgeBaseId: kbId,
    type,
    uri,
    createdAt: new Date(),
  };

  await db.insert(knowledgeBaseSources).values(newSource);

  return newSource;
});
