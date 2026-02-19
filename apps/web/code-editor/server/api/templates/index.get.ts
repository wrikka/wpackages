import { db } from '~/server/db'

export default defineEventHandler(async (event) => {
  try {
    const templates = await db.query.templates.findMany();
    // Drizzle returns comma-separated string, we need to convert it to an array for the frontend
    return templates.map(t => ({ ...t, tags: t.tags?.split(',') || [] }));
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch templates: ${error.message}`
    })
  }
})
