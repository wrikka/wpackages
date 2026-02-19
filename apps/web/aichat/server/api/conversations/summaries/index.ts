import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { conversationSummaries } from '../../database/schema/features';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();
  const query = getQuery(event);

  if (method === 'GET') {
    const { conversationId } = query;
    if (!conversationId) throw createError({ statusCode: 400, message: 'conversationId required' });

    const summary = await db.query.conversationSummaries.findFirst({
      where: eq(conversationSummaries.conversationId, conversationId as string),
      orderBy: (cs, { desc }) => [desc(cs.generatedAt)],
    });
    return summary || null;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { conversationId, summary, keyPoints, actionItems, messageCount } = z.object({
      conversationId: z.string(),
      summary: z.string(),
      keyPoints: z.array(z.string()).optional(),
      actionItems: z.array(z.string()).optional(),
      messageCount: z.number(),
    }).parse(body);

    const result = await db.insert(conversationSummaries).values({
      conversationId,
      summary,
      keyPoints: keyPoints ? JSON.stringify(keyPoints) : null,
      actionItems: actionItems ? JSON.stringify(actionItems) : null,
      messageCount,
    }).returning();

    return result[0];
  }
});
