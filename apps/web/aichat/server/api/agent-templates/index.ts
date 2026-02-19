import { and, desc, eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { agentTemplates } from '../../database/schema/features';

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  systemPrompt: z.string().min(1),
  category: z.string().default('general'),
  icon: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
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
    // Get templates (user's own + public ones)
    const templates = await db.query.agentTemplates.findMany({
      where: or(
        eq(agentTemplates.userId, user.id),
        eq(agentTemplates.isPublic, true),
      ),
      orderBy: [desc(agentTemplates.isPublic), desc(agentTemplates.usageCount)],
    });
    return templates;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = templateSchema.parse(body);

    const template = await db.insert(agentTemplates).values({
      userId: user.id,
      name: data.name,
      description: data.description,
      systemPrompt: data.systemPrompt,
      category: data.category,
      icon: data.icon || 'i-heroicons-robot',
      tags: data.tags ? JSON.stringify(data.tags) : null,
      isPublic: data.isPublic,
    }).returning();

    return template[0];
  }

  if (method === 'PUT') {
    const { id } = query;
    const body = await readBody(event);
    const data = templateSchema.partial().parse(body);

    // Verify ownership
    const existing = await db.query.agentTemplates.findFirst({
      where: and(
        eq(agentTemplates.id, id as string),
        eq(agentTemplates.userId, user.id),
      ),
    });

    if (!existing) {
      throw createError({ statusCode: 404, message: 'Template not found' });
    }

    const template = await db.update(agentTemplates)
      .set({
        ...data,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(agentTemplates.id, id as string))
      .returning();

    return template[0];
  }

  if (method === 'DELETE') {
    const { id } = query;

    await db.delete(agentTemplates)
      .where(and(
        eq(agentTemplates.id, id as string),
        eq(agentTemplates.userId, user.id),
      ));

    return { success: true };
  }
});
