import { eq, or } from 'drizzle-orm';
import { promptTemplates } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const category = getQuery(event).category as string;

  const templates = await db.query.promptTemplates.findMany({
    where: or(
      eq(promptTemplates.organizationId, org.id),
      eq(promptTemplates.isPublic, 1),
    ),
    orderBy: (promptTemplates) => [promptTemplates.rating],
  });

  return createSuccessResponse(templates);
});
