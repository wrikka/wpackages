import { generateId } from 'lucia';
import { promptTemplates } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org, user }, event) => {
  const body = await readBody(event);
  const { name, description, category, promptText, tags = [], isPublic = false } = body;

  validateRequiredFields(body, ['name', 'promptText']);

  const template = {
    id: generateId(15),
    organizationId: org.id,
    userId: user.id,
    name,
    description,
    category,
    promptText,
    tags,
    isPublic,
    rating: 0,
    ratingCount: 0,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(promptTemplates).values(template);

  return createSuccessResponse(template);
});
