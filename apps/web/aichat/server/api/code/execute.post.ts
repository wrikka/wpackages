import { eq } from 'drizzle-orm';
import { codeExecutions } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const body = await readBody(event);
  const { chatSessionId, messageId, code, language } = body;

  validateRequiredFields(body, ['code', 'language']);

  const execution = {
    id: generateId(15),
    chatSessionId,
    messageId,
    code,
    language,
    status: 'pending',
    createdAt: new Date(),
  };

  await db.insert(codeExecutions).values(execution);

  return createSuccessResponse(execution);
});
