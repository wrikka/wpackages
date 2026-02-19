import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { workspaceMembers, workspaces } from '../../database/schema/features';

const workspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const memberships = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, user.id),
      with: { workspace: true },
    });
    return memberships.map(m => m.workspace);
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = workspaceSchema.parse(body);

    const workspace = await db.insert(workspaces).values({
      organizationId: user.organizationId || '',
      ...data,
    }).returning();

    await db.insert(workspaceMembers).values({
      workspaceId: workspace[0].id,
      userId: user.id,
      role: 'owner',
    });

    return workspace[0];
  }
});
