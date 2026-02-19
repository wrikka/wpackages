import { and, eq } from 'drizzle-orm';

import { savedPrompts } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../../composables';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const templateId = getRouterParam(event, 'id');
  if (!templateId) {
    throw createError({ statusCode: 400, statusMessage: 'Template ID is required' });
  }

  const db = await useDb();

  // Verify user owns the template and it belongs to the org
  const [deletedTemplate] = await db
    .delete(savedPrompts)
    .where(and(
      eq(savedPrompts.id, templateId),
      eq(savedPrompts.organizationId, org.id),
      eq(savedPrompts.userId, user.id),
    ))
    .returning();

  if (!deletedTemplate) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Template not found or you do not have permission to delete it',
    });
  }

  return { status: 'ok' };
});
