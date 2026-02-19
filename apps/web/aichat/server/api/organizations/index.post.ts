import { generateId } from 'lucia';

import { useDb } from '../../composables';
import { organizationMembers, organizations } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { name } = body;
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Organization name is required' });
  }

  const db = useDb();
  const newOrg = {
    id: generateId(15),
    name,
    ownerId: user.id,
  };

  const newMember = {
    organizationId: newOrg.id,
    userId: user.id,
    role: 'owner' as const,
  };

  // Use a transaction to ensure both records are created successfully
  await db.transaction(async (tx) => {
    await tx.insert(organizations).values(newOrg);
    await tx.insert(organizationMembers).values(newMember);
  });

  return newOrg;
});
