import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { conversationFavorites } from '../../database/schema/features';

const favoriteSchema = z.object({
  conversationId: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    // Get all favorites for user
    const favorites = await db.query.conversationFavorites.findMany({
      where: eq(conversationFavorites.userId, user.id),
      with: {
        conversation: true,
      },
      orderBy: (f, { desc }) => [desc(f.createdAt)],
    });
    return favorites;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { conversationId } = favoriteSchema.parse(body);

    // Check if already favorited
    const existing = await db.query.conversationFavorites.findFirst({
      where: and(
        eq(conversationFavorites.userId, user.id),
        eq(conversationFavorites.conversationId, conversationId),
      ),
    });

    if (existing) {
      throw createError({ statusCode: 409, message: 'Already favorited' });
    }

    const favorite = await db.insert(conversationFavorites).values({
      userId: user.id,
      conversationId,
    }).returning();

    return favorite[0];
  }

  if (method === 'DELETE') {
    const { conversationId } = getQuery(event);

    await db.delete(conversationFavorites)
      .where(and(
        eq(conversationFavorites.userId, user.id),
        eq(conversationFavorites.conversationId, conversationId as string),
      ));

    return { success: true };
  }
});
