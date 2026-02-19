import { generateId } from 'lucia';
import { rateLimits } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const body = await readBody(event);
  const { type, limit, window, userId } = body;

  validateRequiredFields(body, ['type', 'limit', 'window']);

  const rateLimit = {
    id: generateId(15),
    organizationId: org.id,
    userId,
    type,
    limit,
    window,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(rateLimits).values(rateLimit);

  return createSuccessResponse(rateLimit);
});
