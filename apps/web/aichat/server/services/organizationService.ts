import type { AppUser } from '#shared/types';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { useDb } from '../composables';
import { organizationMembers, organizations } from '../db';

export async function getOrganizationById(orgId: string, userId: string) {
  // TODO: Verify user is a member of the organization
  const db = useDb();
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
    with: {
      members: {
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!org) {
    return null;
  }
  return org;
}

export async function createOrganization(name: string, user: AppUser) {
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

  await db.transaction(async (tx) => {
    await tx.insert(organizations).values(newOrg);
    await tx.insert(organizationMembers).values(newMember);
  });

  return newOrg;
}
