import { generateId } from 'lucia';

import { requireOrg, useDb } from '../../composables';
import { agents } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  requireOrg(event);

  const body = await readBody(event);
  const { name, description, systemPrompt } = body;
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Agent name is required' });
  }

  const db = useDb();
  const newAgent = {
    id: generateId(15),
    organizationId: event.context.org.id,
    userId: user.id, // Creator of the agent
    name,
    description,
    systemPrompt,
    createdAt: new Date(),
  };

  await db.insert(agents).values(newAgent);

  return newAgent;
});
