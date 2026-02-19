import { eq, and } from 'drizzle-orm';
import { requireAuth, requireOrg, useDb } from '../../../composables';
import { mcpServers } from '../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);
  const db = useDb();

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Server ID is required' });
  }

  const server = await db.query.mcpServers.findFirst({
    where: and(
      eq(mcpServers.id, id),
      eq(mcpServers.organizationId, org.id),
    ),
  });

  if (!server) {
    throw createError({ statusCode: 404, statusMessage: 'Server not found' });
  }

  await db.delete(mcpServers).where(eq(mcpServers.id, id));

  return { success: true };
});
