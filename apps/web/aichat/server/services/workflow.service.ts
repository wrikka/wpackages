import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { workflows, workflowExecutions } from '../db/schemas';
import { useDb } from '../composables';
import { workflowSchema } from '../utils/validation-schemas';

export async function createWorkflow(data: any) {
  const db = await useDb();
  const validated = workflowSchema.parse(data);

  const workflow = {
    id: generateId(15),
    organizationId: validated.organizationId,
    userId: validated.userId,
    ...validated,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [result] = await db.insert(workflows).values(workflow).returning();
  return result;
}

export async function executeWorkflow(workflowId: string, input: any) {
  const db = await useDb();
  const workflow = await db.query.workflows.findFirst({
    where: eq(workflows.id, workflowId),
  });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const execution = {
    id: generateId(15),
    workflowId,
    status: 'pending',
    input,
    createdAt: new Date(),
  };

  const [result] = await db.insert(workflowExecutions).values(execution).returning();

  return result;
}

export async function getWorkflowExecutions(workflowId: string) {
  const db = await useDb();
  return await db.query.workflowExecutions.findMany({
    where: eq(workflowExecutions.workflowId, workflowId),
    orderBy: (workflowExecutions) => [workflowExecutions.createdAt],
  });
}
