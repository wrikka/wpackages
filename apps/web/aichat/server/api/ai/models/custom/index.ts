import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { customModels } from '../../database/schema/features';

const modelSchema = z.object({
  name: z.string().min(1),
  provider: z.enum(['openai', 'anthropic', 'ollama', 'custom']),
  modelId: z.string().min(1),
  apiKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  config: z.object({}).passthrough().optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const models = await db.query.customModels.findMany({
      where: and(eq(customModels.userId, user.id), eq(customModels.isEnabled, true)),
    });
    return models;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = modelSchema.parse(body);

    const model = await db.insert(customModels).values({
      userId: user.id,
      ...data,
      config: data.config ? JSON.stringify(data.config) : null,
    }).returning();

    return model[0];
  }

  if (method === 'DELETE') {
    const { id } = getQuery(event);
    await db.update(customModels)
      .set({ isEnabled: false })
      .where(and(eq(customModels.id, id as string), eq(customModels.userId, user.id)));
    return { success: true };
  }
});
