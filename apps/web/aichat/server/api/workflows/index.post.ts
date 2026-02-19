import { generateId } from 'lucia';
import { workflows } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org, user }, event) => {
  const body = await readBody(event);
  const { name, description, definition, isActive = true } = body;

  validateRequiredFields(body, ['name', 'definition']);

  const workflow = {
    id: generateId(15),
    organizationId: org.id,
    userId: user.id,
    name,
    description,
    definition,
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(workflows).values(workflow);

  return createSuccessResponse(workflow);
});
