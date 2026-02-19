import { generateId } from 'lucia';
import { z } from 'zod';

import { savedPrompts } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../composables';

const TemplateInput = z.object({
  name: z.string().min(1),
  promptText: z.string().min(1),
  scope: z.enum(['personal', 'group']).default('personal'),
  groupId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const body = await readBody(event);
  const validation = TemplateInput.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' });
  }

  const { name, promptText, scope, groupId } = validation.data;
  const db = await useDb();

  const newTemplate = {
    id: generateId(15),
    organizationId: org.id,
    userId: user.id,
    name,
    promptText,
    scope,
    groupId: scope === 'group' ? groupId : null,
  };

  await db.insert(savedPrompts).values(newTemplate);

  return newTemplate;
});
