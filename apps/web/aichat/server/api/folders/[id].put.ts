import { and, eq } from 'drizzle-orm';

import { useDb } from '../../composables';
import { folders } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const folderId = getRouterParam(event, 'id');
  if (!folderId) {
    throw createError({ statusCode: 400, statusMessage: 'Folder ID is required' });
  }

  const body = await readBody(event);
  const name = body.name;
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Folder name is required' });
  }

  const db = useDb();

  // Verify user owns this folder
  const folder = await db.query.folders.findFirst({
    where: and(eq(folders.id, folderId), eq(folders.userId, user.id)),
  });

  if (!folder) {
    throw createError({ statusCode: 404, statusMessage: 'Folder not found' });
  }

  await db.update(folders).set({ name }).where(eq(folders.id, folderId));

  return { success: true };
});
