import { generateId } from 'lucia';
import { z } from 'zod';

import { requireOrg, useDb } from '../../composables';
import { knowledgeBases } from '../../db';
import { logAuditEvent } from '../../services/audit';

const MIN_NAME_LENGTH = 1;
const KB_ID_LENGTH = 15;

const bodySchema = z.object({
  description: z.string().optional(),
  name: z.string().min(MIN_NAME_LENGTH, 'Knowledge base name is required'),
});

export default defineEventHandler(async (event) => {
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { description, name } = await readValidatedBody(event, bodySchema.parse);

  const db = await useDb();
  requireOrg(event);

  const newKb = {
    createdAt: new Date(),
    description,
    id: generateId(KB_ID_LENGTH),
    name,
    organizationId: org.id,
    userId: user.id,
  };

  await db.insert(knowledgeBases).values(newKb);

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'knowledge_base.create',
    targetId: newKb.id,
    targetType: 'knowledge_base',
    details: { name, description },
  });

  return newKb;
});
