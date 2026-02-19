import { eq, and } from 'drizzle-orm';
import { longTermMemory } from '../../db';
import { createApiHandler, parseQueryParams, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, user }, event) => {
  const { agentId, key } = parseQueryParams(event, {
    agentId: 'string',
    key: 'string',
  });

  const memory = await db.query.longTermMemory.findFirst({
    where: and(
      eq(longTermMemory.userId, user.id),
      agentId ? eq(longTermMemory.agentId, agentId) : undefined,
      key ? eq(longTermMemory.key, key) : undefined,
    ),
  });

  return createSuccessResponse(memory);
});
