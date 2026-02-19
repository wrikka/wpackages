import { eq } from 'drizzle-orm';
import { rateLimits } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const limits = await db.query.rateLimits.findMany({
    where: eq(rateLimits.organizationId, org.id),
  });

  return createSuccessResponse(limits);
});
