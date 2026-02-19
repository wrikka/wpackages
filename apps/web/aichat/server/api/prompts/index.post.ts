import { generateId } from 'lucia';
import { z } from 'zod';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { savedPrompts } from '../../db';
import { logAuditEvent } from '../../services/audit';

const bodySchema = z.object({
  name: z.string().min(1, 'Prompt name is required'),
  promptText: z.string().min(1, 'Prompt text is required'),
  scope: z.enum(['personal', 'group']).default('personal'),
  groupId: z.string().optional(),
});

const PROMPT_ID_LENGTH = 15;

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const { name, promptText, scope, groupId } = await readValidatedBody(event, bodySchema.parse);

  // TODO: Add validation to ensure user is part of the group if scope is 'group'

  const db = await useDb();

  const newPrompt = {
    id: `prmpt_${generateId(PROMPT_ID_LENGTH)}`,
    organizationId: org.id,
    userId: user.id,
    name,
    promptText,
    scope,
    groupId: scope === 'group' ? groupId : null,
  };

  await db.insert(savedPrompts).values(newPrompt);

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'prompt.create',
    targetId: newPrompt.id,
    targetType: 'prompt',
    details: { name, scope, groupId },
  });

  return newPrompt;
});
