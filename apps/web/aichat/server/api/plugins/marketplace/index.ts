import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { plugins, userPlugins } from '../../database/schema/features';

const pluginSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string(),
  version: z.string().default('1.0.0'),
  manifest: z.object({}).passthrough(),
  code: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const allPlugins = await db.query.plugins.findMany({
      where: eq(plugins.isPublished, true),
      orderBy: [desc(plugins.downloadCount), desc(plugins.rating)],
    });
    return allPlugins;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = pluginSchema.parse(body);
    const plugin = await db.insert(plugins).values({
      userId: user.id,
      ...data,
      manifest: JSON.stringify(data.manifest),
    }).returning();
    return plugin[0];
  }
});
