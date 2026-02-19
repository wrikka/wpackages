import { generateId } from 'lucia';

import { folders } from '@aichat/db';

import { requireAuth, requireOrg, useDb } from '../../composables';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const body = await readBody(event);
  const name = body.name;
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Folder name is required' });
  }

  const db = useDb();
  const org = requireOrg(event);

  const newFolder = {
    id: generateId(15),
    organizationId: org.id,
    userId: user.id,
    name,
  };

  await db.insert(folders).values(newFolder);

  return newFolder;
});
