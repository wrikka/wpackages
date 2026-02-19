import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { guestInvites } from '@aichat/db';
import { useDb } from '../../../composables';

const paramsSchema = z.object({
  token: z.string(),
});

const SINGLE_INVITE_LIMIT = 1;

export default defineEventHandler(async (event) => {
  const db = await useDb();
  const { token } = await getValidatedRouterParams(event, paramsSchema.parse);

  const [invite] = await db
    .select()
    .from(guestInvites)
    .where(eq(guestInvites.token, token))
    .limit(SINGLE_INVITE_LIMIT);

  if (!invite) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invite not found',
    });
  }

  if (invite.usedAt) {
    throw createError({
      statusCode: 410, // Gone
      statusMessage: 'Invite has already been used',
    });
  }

  if (new Date(invite.expiresAt) < new Date()) {
    throw createError({
      statusCode: 410, // Gone
      statusMessage: 'Invite has expired',
    });
  }

  // Optionally, mark the invite as used if it's a single-use token.
  // await db.update(guestInvites).set({ usedAt: new Date() }).where(eq(guestInvites.id, invite.id));

  return {
    chatSessionId: invite.chatSessionId,
  };
});
