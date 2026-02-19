import { and, eq } from 'drizzle-orm';

import { savedPrompts } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../composables';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const db = await useDb();

  const templates = await db.query.savedPrompts.findMany({
    where: and(
      eq(savedPrompts.organizationId, org.id),
      // For now, only show personal templates. We can expand this later.
      eq(savedPrompts.scope, 'personal'),
      eq(savedPrompts.userId, user.id),
    ),
    orderBy: (prompts, { desc }) => [desc(prompts.name)],
  });

  return templates;
});
