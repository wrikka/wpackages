import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { folderMembers, users } from '@aichat/db';
import { requireAuth, requireOrg, useDb } from '../../../composables';

const ShareInput = z.object({
  role: z.enum(['editor', 'viewer']),
  userId: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);

  const folderId = getRouterParam(event, 'folderId');
  if (!folderId) {
    throw createError({ statusCode: 400, statusMessage: 'Folder ID is required' });
  }

  const body = await readBody(event);
  const validation = ShareInput.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid input' });
  }

  const { userId, role } = validation.data;

  const db = await useDb();

  // TODO: Verify user has permission to share this folder (is owner or editor)

  const userExistsInOrg = await db.query.users.findFirst({
    where: and(eq(users.id, userId), eq(users.organizationId, org.id)),
  });

  if (!userExistsInOrg) {
    throw createError({ statusCode: 404, statusMessage: 'User not found in this organization' });
  }

  await db
    .insert(folderMembers)
    .values({
      folderId,
      role,
      sharedBy: user.id,
      userId,
    })
    .onConflictDoUpdate({
      set: { role },
      target: [folderMembers.folderId, folderMembers.userId],
    });

  return { status: 'ok' };
});
