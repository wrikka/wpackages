import { eq } from 'drizzle-orm';
import { chatTemplates } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const templates = await db.query.chatTemplates.findMany({
    where: eq(chatTemplates.organizationId, org.id),
    orderBy: (chatTemplates) => [chatTemplates.isDefault, chatTemplates.createdAt],
  });

  return createSuccessResponse(templates);
});
