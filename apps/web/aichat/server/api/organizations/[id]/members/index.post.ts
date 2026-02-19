import { eq } from 'drizzle-orm';

import { useDb } from '../../../../composables';
import { organizationMembers, users } from '../../../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const orgId = getRouterParam(event, 'id');
  if (!orgId) {
    throw createError({ statusCode: 400, statusMessage: 'Organization ID is required' });
  }

  const body = await readBody(event);
  const { email, role } = body;
  if (!email || !role) {
    throw createError({ statusCode: 400, statusMessage: 'Email and role are required' });
  }

  // TODO: Check if the current user is an owner/admin of the organization

  const db = useDb();

  // Find user by email (assuming username is email for now)
  const userToAdd = await db.query.users.findFirst({
    where: eq(users.username, email),
  });

  if (!userToAdd) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
  }

  const newMember = {
    organizationId: orgId,
    userId: userToAdd.id,
    role,
  };

  await db.insert(organizationMembers).values(newMember);

  return { success: true };
});
