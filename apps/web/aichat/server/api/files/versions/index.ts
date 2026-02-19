import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { fileVersions } from '../../database/schema/features';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const { fileId } = getQuery(event);
    if (!fileId) throw createError({ statusCode: 400, message: 'fileId required' });

    const versions = await db.query.fileVersions.findMany({
      where: eq(fileVersions.fileId, fileId as string),
      orderBy: (fv, { desc }) => [desc(fv.version)],
    });
    return versions;
  }
});
