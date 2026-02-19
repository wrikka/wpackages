import { Liveblocks } from '@liveblocks/node';
import { z } from 'zod';

import { requireAuth } from '../../composables';

const bodySchema = z.object({
  room: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const { room } = await readValidatedBody(event, bodySchema.parse);

  const { liveblocksSecretKey } = useRuntimeConfig();
  if (!liveblocksSecretKey) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Liveblocks secret key is not configured. Please set LIVEBLOCKS_SECRET_KEY in your environment variables.',
    });
  }

  const liveblocks = new Liveblocks({
    secret: liveblocksSecretKey,
  });

  // Get user info
  const userInfo = {
    name: user.name || 'Anonymous',
    picture: user.avatarUrl || undefined,
  };

  // Start an auth session for the user
  const session = liveblocks.prepareSession(user.id, { userInfo });

  // Give the user access to the room
  session.allow(room, session.FULL_ACCESS);

  // Authorize the user and return the auth token
  const { status, body } = await session.authorize();
  setResponseStatus(event, status);
  return JSON.parse(body);
});
