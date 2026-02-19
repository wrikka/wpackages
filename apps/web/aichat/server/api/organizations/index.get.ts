import { organizationMembers, organizations } from '@aichat/db';
import { eq, inArray } from 'drizzle-orm';
import { requireAuth, useDb } from '../../composables';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const db = useDb();

  // Find all organizations the user is a member of
  const memberships = await db.query.organizationMembers.findMany({
    where: eq(organizationMembers.userId, user.id),
  });

  if (memberships.length === 0) {
    return [];
  }

  // Fetch the details of those organizations
  const orgs = await db.query.organizations.findMany({
    where: inArray(organizations.id, memberships.map((m: any) => m.organizationId)),
  });

  return orgs;
});
