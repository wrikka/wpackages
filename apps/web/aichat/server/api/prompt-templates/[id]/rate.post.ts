import { eq, sql } from 'drizzle-orm';
import { requireAuth, useDb } from '../../../composables';
import { promptTemplates, promptRatings } from '../../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const db = useDb();

  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Template ID is required' });
  }

  const body = await readBody(event);
  const { rating } = body;

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating must be between 1 and 5',
    });
  }

  const existingRating = await db.query.promptRatings.findFirst({
    where: (promptRatings) =>
      sql`${promptRatings.promptTemplateId} = ${id} AND ${promptRatings.userId} = ${user.id}`,
  });

  if (existingRating) {
    await db.update(promptRatings)
      .set({ rating })
      .where(eq(promptRatings.id, existingRating.id));
  } else {
    await db.insert(promptRatings).values({
      id: generateId(15),
      promptTemplateId: id,
      userId: user.id,
      rating,
      createdAt: new Date(),
    });
  }

  await db.execute(sql`
    UPDATE prompt_templates
    SET rating = (
      SELECT AVG(rating) FROM prompt_ratings WHERE prompt_template_id = ${id}
    ),
    rating_count = (
      SELECT COUNT(*) FROM prompt_ratings WHERE prompt_template_id = ${id}
    )
    WHERE id = ${id}
  `);

  return { success: true };
});
