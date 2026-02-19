import { eq, and } from 'drizzle-orm';
import { generateId } from 'lucia';
import { mcpServers } from '../db';
import { useDb } from '../composables';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from './api-helpers';
import { mcpServerSchema } from './validation-schemas';

export async function createMcpServer(data: McpServerInput) {
  const db = useDb();
  const validated = mcpServerSchema.parse(data);

  const server = {
    id: generateId(15),
    ...validated,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [result] = await db.insert(mcpServers).values(server).returning();
  return result;
}

export async function updateMcpServer(id: string, data: Partial<McpServerInput>) {
  const db = useDb();
  const validated = mcpServerSchema.partial().parse(data);

  const [result] = await db
    .update(mcpServers)
    .set({ ...validated, updatedAt: new Date() })
    .where(eq(mcpServers.id, id))
    .returning();

  return result;
}

export async function deleteMcpServer(id: string) {
  const db = useDb();
  await db.delete(mcpServers).where(eq(mcpServers.id, id));
}
