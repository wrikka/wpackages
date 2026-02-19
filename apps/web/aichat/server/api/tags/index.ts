import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { conversationTags, tags } from '../../database/schema/features';

const tagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const tagConversationSchema = z.object({
  conversationId: z.string(),
  tagId: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const method = event.method;
  const db = useDb();
  const query = getQuery(event);

  if (method === 'GET') {
    if (query.conversationId) {
      // Get tags for a conversation
      const conversationTagList = await db.query.conversationTags.findMany({
        where: eq(conversationTags.conversationId, query.conversationId as string),
        with: {
          tag: true,
        },
      });
      return conversationTagList.map(ct => ct.tag);
    }

    // Get all tags for user
    const userTags = await db.query.tags.findMany({
      where: eq(tags.userId, user.id),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return userTags;
  }

  if (method === 'POST') {
    const body = await readBody(event);

    // Tag conversation
    if (body.conversationId && body.tagId) {
      const { conversationId, tagId } = tagConversationSchema.parse(body);

      const existing = await db.query.conversationTags.findFirst({
        where: and(
          eq(conversationTags.conversationId, conversationId),
          eq(conversationTags.tagId, tagId),
        ),
      });

      if (existing) {
        throw createError({ statusCode: 409, message: 'Tag already applied' });
      }

      const result = await db.insert(conversationTags).values({
        conversationId,
        tagId,
      }).returning();
      return result[0];
    }

    // Create new tag
    const { name, color } = tagSchema.parse(body);

    // Check for duplicate name
    const existing = await db.query.tags.findFirst({
      where: and(eq(tags.userId, user.id), eq(tags.name, name)),
    });

    if (existing) {
      throw createError({ statusCode: 409, message: 'Tag name already exists' });
    }

    const tag = await db.insert(tags).values({
      userId: user.id,
      name,
      color: color || '#3b82f6',
    }).returning();

    return tag[0];
  }

  if (method === 'DELETE') {
    if (query.tagId && query.conversationId) {
      // Remove tag from conversation
      await db.delete(conversationTags)
        .where(and(
          eq(conversationTags.tagId, query.tagId as string),
          eq(conversationTags.conversationId, query.conversationId as string),
        ));
      return { success: true };
    }

    if (query.tagId) {
      // Delete tag completely
      await db.delete(tags).where(eq(tags.id, query.tagId as string));
      return { success: true };
    }
  }
});
