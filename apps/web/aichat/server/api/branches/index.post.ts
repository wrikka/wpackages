import { eq, and } from 'drizzle-orm';
import { chatBranches } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const body = await readBody(event);
  const { chatSessionId, name, branchPointMessageId } = body;

  validateRequiredFields(body, ['chatSessionId', 'name', 'branchPointMessageId']);

  const branch = {
    id: generateId(15),
    chatSessionId,
    name,
    branchPointMessageId,
    createdAt: new Date(),
  };

  await db.insert(chatBranches).values(branch);

  return createSuccessResponse(branch);
});
