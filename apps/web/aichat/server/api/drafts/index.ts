import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { messageDrafts } from '../../database/schema/features';

const draftSchema = z.object({
  conversationId: z.string(),
  content: z.string(),
  attachments: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const { conversationId } = getQuery(event);
    if (!conversationId) throw createError({ statusCode: 400, message: 'conversationId required' });

    const draft = await db.query.messageDrafts.findFirst({
      where: and(
        eq(messageDrafts.userId, user.id),
        eq(messageDrafts.conversationId, conversationId as string),
      ),
      orderBy: (md, { desc }) => [desc(md.savedAt)],
    });
    return draft || null;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { conversationId, content, attachments } = draftSchema.parse(body);

    // Delete existing draft
    await db.delete(messageDrafts)
      .where(and(
        eq(messageDrafts.userId, user.id),
        eq(messageDrafts.conversationId, conversationId),
      ));

    const draft = await db.insert(messageDrafts).values({
      userId: user.id,
      conversationId,
      content,
      attachments: attachments ? JSON.stringify(attachments) : null,
    }).returning();

    return draft[0];
  }

  if (method === 'DELETE') {
    const { conversationId } = getQuery(event);
    await db.delete(messageDrafts)
      .where(and(
        eq(messageDrafts.userId, user.id),
        eq(messageDrafts.conversationId, conversationId as string),
      ));
    return { success: true };
  }
});
