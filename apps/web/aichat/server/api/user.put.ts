import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth, useDb } from '~/server/composables';
import { users } from '~/server/database/schema';

const userUpdateSchema = z.object({
  aiNickname: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const body = await readBody(event);

  const validation = userUpdateSchema.safeParse(body);
  if (!validation.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request body' });
  }

  const { aiNickname } = validation.data;

  if (aiNickname === undefined) {
    throw createError({ statusCode: 400, statusMessage: 'No update data provided' });
  }

  try {
    const db = await useDb();
    await db
      .update(users)
      .set({ aiNickname })
      .where(eq(users.id, user.id));

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    return updatedUser;
  } catch (error) {
    console.error('Failed to update user profile', error);
    throw createError({ statusCode: 500, statusMessage: 'Could not update user profile' });
  }
});
