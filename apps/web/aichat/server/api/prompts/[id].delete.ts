import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../../composables';
import { savedPrompts } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const promptId = getRouterParam(event, 'id');
  if (!promptId) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt ID is required' });
  }

  const db = await useDb();

  // Verify user owns the prompt
  const [prompt] = await db
    .select({ id: savedPrompts.id })
    .from(savedPrompts)
    .where(and(
      eq(savedPrompts.id, promptId),
      eq(savedPrompts.userId, user.id),
      eq(savedPrompts.organizationId, org.id),
    ));

  if (!prompt) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Prompt not found or you do not have permission to delete it.',
    });
  }

  await db.delete(savedPrompts).where(eq(savedPrompts.id, promptId));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'prompt.delete',
    targetId: promptId,
    targetType: 'prompt',
  });

  return { success: true };
});
