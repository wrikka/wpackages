import { eq } from 'drizzle-orm';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { organizations } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const orgId = getRouterParam(event, 'id');
  if (!orgId) {
    throw createError({ statusCode: 400, statusMessage: 'Organization ID is required' });
  }

  const db = useDb();
  // TODO: Check if user is a member of this org
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
    throw createError({ statusCode: 404, statusMessage: 'Organization not found' });
  }

  return org;
});
