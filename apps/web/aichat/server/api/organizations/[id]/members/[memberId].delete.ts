import { and, eq } from 'drizzle-orm';

import { useDb } from '../../../../composables';
import { organizationMembers } from '../../../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const orgId = getRouterParam(event, 'id');
  const memberId = getRouterParam(event, 'memberId');
  if (!orgId || !memberId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Organization ID and Member ID are required',
    });
  }

  // TODO: Check if the current user is an owner/admin of the organization

  const db = useDb();
  await db
    .delete(organizationMembers)
    .where(
      and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, memberId)),
    );

  return { success: true };
});
