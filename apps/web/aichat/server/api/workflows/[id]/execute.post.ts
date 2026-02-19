import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { requireAuth, requireOrg, useDb } from '../../../composables';
import { workflows, workflowExecutions } from '../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);
  const db = useDb();

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Workflow ID is required' });
  }

  const body = await readBody(event);
  const { input } = body;

  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.id, id),
  });

  if (!workflow) {
    throw createError({ statusCode: 404, statusMessage: 'Workflow not found' });
  }

  const execution = {
    id: generateId(15),
    workflowId: id,
    userId: user.id,
    status: 'pending',
    input,
    createdAt: new Date(),
  };

  await db.insert(workflowExecutions).values(execution);

  return execution;
});
