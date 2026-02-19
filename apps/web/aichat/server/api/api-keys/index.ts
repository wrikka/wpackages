import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { apiKeys } from '../../database/schema/features';

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const keys = await db.query.apiKeys.findMany({
      where: and(eq(apiKeys.userId, user.id), eq(apiKeys.isRevoked, false)),
      orderBy: (k, { desc }) => [desc(k.createdAt)],
    });
    return keys.map(k => ({
      ...k,
      keyHash: undefined,
    }));
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { name, permissions, expiresAt } = createKeySchema.parse(body);

    const apiKey = `wai_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    const key = await db.insert(apiKeys).values({
      userId: user.id,
      name,
      keyHash,
      keyPrefix: apiKey.slice(0, 8),
      permissions: permissions ? JSON.stringify(permissions) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();

    return { ...key[0], fullKey: apiKey };
  }

  if (method === 'DELETE') {
    const { id } = getQuery(event);
    await db.update(apiKeys)
      .set({ isRevoked: true })
      .where(and(eq(apiKeys.id, id as string), eq(apiKeys.userId, user.id)));
    return { success: true };
  }
});
