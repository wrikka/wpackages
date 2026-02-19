import { eq } from 'drizzle-orm';
import { workflows } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const workflowsList = await db.query.workflows.findMany({
    where: eq(workflows.organizationId, org.id),
    orderBy: (workflows) => [workflows.createdAt],
  });

  return createSuccessResponse(workflowsList);
});
