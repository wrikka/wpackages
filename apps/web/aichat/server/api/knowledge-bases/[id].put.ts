import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { useDb } from '../../composables';
import { knowledgeBases } from '../../db';
import { logAuditEvent } from '../../services/audit';

const MIN_NAME_LENGTH = 1;

const bodySchema = z.object({
  description: z.string().optional(),
  name: z.string().min(MIN_NAME_LENGTH, 'Knowledge base name is required'),
});

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const kbId = getRouterParam(event, 'id');
  if (!kbId) {
    throw createError({ statusCode: 400, statusMessage: 'Knowledge Base ID is required' });
  }

  const { description, name } = await readValidatedBody(event, bodySchema.parse);

  const db = await useDb();

  // First, verify the KB exists and the user is the owner.
  const [kb] = await db
    .select({ id: knowledgeBases.id })
    .from(knowledgeBases)
    .where(and(eq(knowledgeBases.id, kbId), eq(knowledgeBases.userId, user.id)));

  if (!kb) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Knowledge Base not found or you do not have permission to edit it.',
    });
  }

  // Now, update it.
  await db
    .update(knowledgeBases)
    .set({ name, description })
    .where(eq(knowledgeBases.id, kbId));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'knowledge_base.update',
    targetId: kbId,
    targetType: 'knowledge_base',
    details: { name, description },
  });

  return { success: true };
});
