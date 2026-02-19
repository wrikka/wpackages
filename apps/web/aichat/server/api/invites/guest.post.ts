import { nanoid } from 'nanoid';
import { z } from 'zod';

import { createDbClient, guestInvites } from '../../db';
import { logAuditEvent } from '../../services/audit';

const DEFAULT_EXPIRATION_HOURS = 24;
const MIN_EXPIRATION_HOURS = 1;
const TOKEN_LENGTH = 32;

const inviteSchema = z.object({
  chatSessionId: z.string(),
  expiresInHours: z.number().min(MIN_EXPIRATION_HOURS).default(DEFAULT_EXPIRATION_HOURS),
});

export default defineEventHandler(async (event) => {
  const db = await createDbClient();
  const { user, org } = event.context;
  if (!user || !org) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const { chatSessionId, expiresInHours } = await readValidatedBody(event, inviteSchema.parse);

  // TODO: Check if the user has permission to share this chat session

  const token = nanoid(TOKEN_LENGTH);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const [newInvite] = await db.insert(guestInvites).values({
    chatSessionId,
    expiresAt,
    id: `gi_${nanoid()}`,
    inviterId: user.id,
    organizationId: org.id,
    token,
  }).returning();

  await logAuditEvent({
    action: 'guest_invite.create',
    actorId: user.id,
    organizationId: org.id,
    targetId: newInvite.id,
    targetType: 'guest_invite',
    details: { chatSessionId, expiresInHours },
  });

  const inviteLink = `${getRequestURL(event).origin}/guest/${token}`;

  return {
    expiresAt: newInvite.expiresAt,
    inviteLink,
  };
});
