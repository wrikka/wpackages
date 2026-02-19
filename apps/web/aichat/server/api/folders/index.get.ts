import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { folders } from '../../db';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const db = useDb();
  requireOrg(event);

  const folderList = await db.query.folders.findMany({
    where: and(
      eq(folders.organizationId, event.context.org.id),
      eq(folders.userId, user.id),
    ),
  });

  return folderList;
});
