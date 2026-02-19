import { eq } from 'drizzle-orm';
import { whiteboards } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const whiteboardsList = await db.query.whiteboards.findMany({
    where: eq(whiteboards.organizationId, org.id),
    orderBy: (whiteboards) => [whiteboards.updatedAt],
  });

  return createSuccessResponse(whiteboardsList);
});
