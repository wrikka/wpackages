import { eq, and } from 'drizzle-orm';
import { webSearchQueries } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const body = await readBody(event);
  const { chatSessionId, messageId, query, results, citations = [] } = body;

  validateRequiredFields(body, ['chatSessionId', 'query']);

  const searchQuery = {
    id: generateId(15),
    chatSessionId,
    messageId,
    query,
    results,
    citations,
    createdAt: new Date(),
  };

  await db.insert(webSearchQueries).values(searchQuery);

  return createSuccessResponse(searchQuery);
});
