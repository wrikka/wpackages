import { eq, and } from 'drizzle-orm';
import { whiteboards } from '../../db';
import { createApiHandler, getEntityById, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Whiteboard ID is required' });
  }

  const whiteboard = await getEntityById(db, whiteboards, id, org.id);
  if (!whiteboard) {
    throw createError({ statusCode: 404, statusMessage: 'Whiteboard not found' });
  }

  const body = await readBody(event);
  const { canvasData } = body;

  await db.update(whiteboards)
    .set({ canvasData, updatedAt: new Date() })
    .where(eq(whiteboards.id, id));

  return createSuccessResponse({ success: true });
});
