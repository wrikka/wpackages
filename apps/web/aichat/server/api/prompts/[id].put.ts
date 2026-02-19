import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { requireAuth, requireOrg, useDb } from '../../../composables';
import { savedPrompts } from '../../../db';
import { logAuditEvent } from '../../../services/audit';

const bodySchema = z.object({
  name: z.string().min(1, 'Prompt name is required'),
  promptText: z.string().min(1, 'Prompt text is required'),
  scope: z.enum(['personal', 'group']).default('personal'),
  groupId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const promptId = getRouterParam(event, 'id');
  if (!promptId) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt ID is required' });
  }

  const { name, promptText, scope, groupId } = await readValidatedBody(event, bodySchema.parse);

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
      statusMessage: 'Prompt not found or you do not have permission to edit it.',
    });
  }

  await db
    .update(savedPrompts)
    .set({
      name,
      promptText,
      scope,
      groupId: scope === 'group' ? groupId : null,
    })
    .where(eq(savedPrompts.id, promptId));

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'prompt.update',
    targetId: promptId,
    targetType: 'prompt',
    details: { name, scope, groupId },
  });

  return { success: true };
});
