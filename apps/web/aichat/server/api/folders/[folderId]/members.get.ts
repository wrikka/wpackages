import { folderMembers, users } from '@aichat/db';
import { eq } from 'drizzle-orm';
import { requireAuth, useDb } from '../../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const folderId = getRouterParam(event, 'folderId');
  if (!folderId) {
    throw createError({ statusCode: 400, statusMessage: 'Folder ID is required' });
  }

  const db = await useDb();

  // TODO: Verify user has access to this folder first

  const members = await db
    .select({
      role: folderMembers.role,
      userId: users.id,
      username: users.username,
    })
    .from(folderMembers)
    .leftJoin(users, eq(folderMembers.userId, users.id))
    .where(eq(folderMembers.folderId, folderId));

  return members;
});
