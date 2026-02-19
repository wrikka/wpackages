import { eq } from 'drizzle-orm';
import { chatBranches } from '../../db';
import { createApiHandler, parseQueryParams, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const { chatSessionId } = parseQueryParams(event, {
    chatSessionId: 'string',
  });

  const branches = await db.query.chatBranches.findMany({
    where: chatSessionId ? eq(chatBranches.chatSessionId, chatSessionId) : undefined,
    orderBy: (chatBranches) => [chatBranches.createdAt],
  });

  return createSuccessResponse(branches);
});
