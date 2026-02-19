import { createTemplateEngine } from '~/server/ai/engines/templates/template-engine'

const templateEngine = createTemplateEngine()

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const category = query.category as string
    const language = query.language as string

    const templates = await templateEngine.getTemplates(category, language)

    return {
      success: true,
      templates,
      categories: templateEngine.getCategories()
    }

  } catch (error) {
    console.error('Template Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get templates'
    })
  }
})
