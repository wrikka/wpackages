import { eq } from 'drizzle-orm';
import { multimodalAttachments } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const body = await readBody(event);
  const { messageId, type, mimeType, filePath, analysis } = body;

  validateRequiredFields(body, ['messageId', 'type', 'mimeType', 'filePath']);

  const attachment = {
    id: generateId(15),
    messageId,
    type,
    mimeType,
    filePath,
    analysis,
    createdAt: new Date(),
  };

  await db.insert(multimodalAttachments).values(attachment);

  return createSuccessResponse(attachment);
});
