import { and, eq } from 'drizzle-orm';

import { folderMembers } from '@aichat/db';
import { requireAuth, useDb } from '../../../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const folderId = getRouterParam(event, 'folderId');
  const userId = getRouterParam(event, 'userId');

  if (!folderId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Folder ID and User ID are required' });
  }

  const db = await useDb();

  // TODO: Verify user has permission to remove members from this folder (is owner or editor)

  await db
    .delete(folderMembers)
    .where(and(eq(folderMembers.folderId, folderId), eq(folderMembers.userId, userId)));

  return { status: 'ok' };
});
