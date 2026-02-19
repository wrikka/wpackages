import { organizationMembers } from '@aichat/db';
import { and, eq } from 'drizzle-orm';
import { useDb } from '../composables';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  const orgId = getHeader(event, 'x-org-id');

  if (orgId && user) {
    const db = useDb();
    const membership = await db.query.organizationMembers.findFirst({
      where: and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, user.id),
      ),
    });

    if (membership) {
      event.context.org = { id: orgId, role: membership.role };
    } else {
      // If orgId is provided but user is not a member, throw an error
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }
  }
});
