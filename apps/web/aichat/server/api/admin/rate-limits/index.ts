import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { rateLimits } from '../../database/schema/features';

const limitSchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  maxRequestsPerMinute: z.number().min(1).max(1000).optional(),
  maxTokensPerDay: z.number().min(1000).max(10000000).optional(),
  maxConversationsPerDay: z.number().min(1).max(1000).optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  // Check admin access
  if (!user.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' });
  }

  if (method === 'GET') {
    const limits = await db.query.rateLimits.findMany({
      orderBy: (rl, { desc }) => [desc(rl.createdAt)],
    });
    return limits;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = limitSchema.parse(body);

    const limit = await db.insert(rateLimits).values({
      userId: data.userId,
      organizationId: data.organizationId,
      type: data.organizationId ? 'org' : 'user',
      maxRequestsPerMinute: data.maxRequestsPerMinute || 60,
      maxTokensPerDay: data.maxTokensPerDay || 100000,
      maxConversationsPerDay: data.maxConversationsPerDay || 100,
    }).returning();

    return limit[0];
  }

  if (method === 'DELETE') {
    const { id } = getQuery(event);
    await db.delete(rateLimits).where(eq(rateLimits.id, id as string));
    return { success: true };
  }
});
