import { eq, and } from 'drizzle-orm';
import { whiteboards } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org, user }, event) => {
  const body = await readBody(event);
  const { name, canvasData, chatSessionId } = body;

  validateRequiredFields(body, ['name', 'canvasData']);

  const whiteboard = {
    id: generateId(15),
    organizationId: org.id,
    userId: user.id,
    chatSessionId,
    name,
    canvasData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(whiteboards).values(whiteboard);

  return createSuccessResponse(whiteboard);
});
