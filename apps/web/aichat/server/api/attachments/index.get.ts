import { and, desc, eq } from 'drizzle-orm';

import { requireOrg, useDb } from '../../composables';
import { attachments } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  requireOrg(event);

  const db = useDb();

  const list = await db.query.attachments.findMany({
    where: and(
      eq(attachments.organizationId, event.context.org.id),
      eq(attachments.userId, user.id),
    ),
    orderBy: [desc(attachments.createdAt)],
    limit: 50,
  });

  return list.map(a => ({
    ...a,
    url: `/api/attachments/${a.id}`,
  }));
});
