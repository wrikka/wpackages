import { eq } from 'drizzle-orm';
import { mcpServers } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const servers = await db.query.mcpServers.findMany({
    where: eq(mcpServers.organizationId, org.id),
    orderBy: (mcpServers) => [mcpServers.createdAt],
  });

  return createSuccessResponse(servers);
});
