import { agents } from '@aichat/db';
import { and, eq } from 'drizzle-orm';
import { requireAuth, requireOrg, useDb } from '../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);
  const org = requireOrg(event);

  const db = useDb();
  const agentList = await db.query.agents.findMany({
    where: and(
      eq(agents.organizationId, org.id),
      // TODO: Decide if agents are user-specific or org-wide
      // eq(agents.userId, user.id)
    ),
    orderBy: (agents, { desc }) => [desc(agents.createdAt)],
  });

  return agentList;
});
