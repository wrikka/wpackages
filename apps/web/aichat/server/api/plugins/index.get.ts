import { eq } from 'drizzle-orm';
import { plugins, organizationPlugins } from '../../db';
import { createApiHandler, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org }) => {
  const orgPlugins = await db.query.organizationPlugins.findMany({
    where: eq(organizationPlugins.organizationId, org.id),
    with: {
      plugin: true,
    },
  });

  return createSuccessResponse(orgPlugins);
});
