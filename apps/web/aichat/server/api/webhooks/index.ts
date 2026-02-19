import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { webhookDeliveries, webhooks } from '../../database/schema/features';

const webhookSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  secret: z.string().optional(),
  events: z.array(z.string()),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const hooks = await db.query.webhooks.findMany({
      where: eq(webhooks.userId, user.id),
      orderBy: (w, { desc }) => [desc(w.createdAt)],
    });
    return hooks;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = webhookSchema.parse(body);

    const hook = await db.insert(webhooks).values({
      userId: user.id,
      ...data,
      events: JSON.stringify(data.events),
    }).returning();

    return hook[0];
  }

  if (method === 'DELETE') {
    const { id } = getQuery(event);
    await db.delete(webhooks)
      .where(and(eq(webhooks.id, id as string), eq(webhooks.userId, user.id)));
    return { success: true };
  }
});
