import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { savedPrompts } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../../composables';

const TemplateInput = z.object({
  name: z.string().min(1).optional(),
  promptText: z.string().min(1).optional(),
  scope: z.enum(['personal', 'group']).optional(),
  groupId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const templateId = getRouterParam(event, 'id');
  if (!templateId) {
    throw createError({ statusCode: 400, statusMessage: 'Template ID is required' });
  }

  const body = await readBody(event);
  const validation = TemplateInput.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' });
  }

  const db = await useDb();

  // Verify user owns the template and it belongs to the org
  const [updatedTemplate] = await db
    .update(savedPrompts)
    .set(validation.data)
    .where(and(
      eq(savedPrompts.id, templateId),
      eq(savedPrompts.organizationId, org.id),
      eq(savedPrompts.userId, user.id),
    ))
    .returning();

  if (!updatedTemplate) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Template not found or you do not have permission to edit it',
    });
  }

  return updatedTemplate;
});
