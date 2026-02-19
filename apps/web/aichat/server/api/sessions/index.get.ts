import { chatSessions } from '@aichat/db';
import { and, eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const db = useDb();
  requireOrg(event);

  const sessions = await db.query.chatSessions.findMany({
    where: and(
      eq(chatSessions.organizationId, event.context.org.id),
      eq(chatSessions.userId, user.id),
    ),
    orderBy: (chatSessions, { desc }) => [desc(chatSessions.updatedAt)],
  });

  return sessions;
});
