import { eq, and } from 'drizzle-orm';
import { longTermMemory } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, user }, event) => {
  const body = await readBody(event);
  const { agentId, key, value } = body;

  validateRequiredFields(body, ['key', 'value']);

  const existing = await db.query.longTermMemory.findFirst({
    where: and(
      eq(longTermMemory.userId, user.id),
      eq(longTermMemory.key, key),
      agentId ? eq(longTermMemory.agentId, agentId) : undefined,
    ),
  });

  if (existing) {
    await db.update(longTermMemory)
      .set({ value })
      .where(eq(longTermMemory.id, existing.id));
  } else {
    await db.insert(longTermMemory).values({
      id: generateId(15),
      userId: user.id,
      agentId,
      key,
      value,
      createdAt: new Date(),
    });
  }

  return createSuccessResponse({ success: true });
});
