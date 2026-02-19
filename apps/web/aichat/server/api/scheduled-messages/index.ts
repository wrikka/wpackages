import { and, eq, lte } from 'drizzle-orm';
import { z } from 'zod';
import { scheduledMessages } from '../../database/schema/features';

const scheduleSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
  scheduledAt: z.string().datetime(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const messages = await db.query.scheduledMessages.findMany({
      where: and(
        eq(scheduledMessages.userId, user.id),
        eq(scheduledMessages.status, 'pending'),
      ),
      with: {
        conversation: true,
      },
      orderBy: (sm, { asc }) => [asc(sm.scheduledAt)],
    });
    return messages;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { conversationId, content, scheduledAt } = scheduleSchema.parse(body);

    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      throw createError({ statusCode: 400, message: 'Scheduled time must be in the future' });
    }

    const message = await db.insert(scheduledMessages).values({
      userId: user.id,
      conversationId,
      content,
      scheduledAt: scheduledDate,
    }).returning();

    return message[0];
  }

  if (method === 'DELETE') {
    const { id } = getQuery(event);

    await db.delete(scheduledMessages)
      .where(and(
        eq(scheduledMessages.id, id as string),
        eq(scheduledMessages.userId, user.id),
      ));

    return { success: true };
  }
});
