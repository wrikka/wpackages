import { db } from '~/server/db'
import { templates } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description, icon, tags } = body

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template name is required',
    })
  }

  try {
    const newTemplate = await db.insert(templates).values({
      name,
      description,
      icon,
      tags: tags?.join(','), // Store tags as a comma-separated string
    }).returning()

    return { success: true, template: newTemplate[0] }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create template: ${error.message}`,
    })
  }
})
