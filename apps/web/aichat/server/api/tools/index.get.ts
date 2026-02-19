import { tools } from '../../db';
import { requireAuth, useDb } from '../../composables';

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const db = await useDb();

  const allTools = await db.select().from(tools);

  // In a real scenario, we might want to seed this table with default tools.
  // For now, it will be empty until we add a way to create them.

  return allTools;
});
