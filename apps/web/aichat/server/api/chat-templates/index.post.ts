import { generateId } from 'lucia';
import { chatTemplates } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const body = await readBody(event);
  const { name, description, category, systemPrompt, model = 'gpt-3.5-turbo', icon, isDefault = false } = body;

  validateRequiredFields(body, ['name', 'category', 'systemPrompt']);

  const template = {
    id: generateId(15),
    organizationId: org.id,
    name,
    description,
    category,
    systemPrompt,
    model,
    icon,
    isDefault,
    createdAt: new Date(),
  };

  await db.insert(chatTemplates).values(template);

  return createSuccessResponse(template);
});
