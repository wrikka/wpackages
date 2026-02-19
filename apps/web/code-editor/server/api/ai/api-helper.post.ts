import { createAPIHelperEngine } from '~/server/ai'
import type { AIAPIHelperRequest, AIAPIHelperResponse } from '~/shared/types/ai'

const apiHelperEngine = createAPIHelperEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIAPIHelperRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await apiHelperEngine.generateAPIIntegration({
      code: body.code,
      language: body.language,
      apiType: body.apiType || 'rest',
      options: body.options || {}
    })

    return {
      success: true,
      integration: result.integration,
      clientCode: result.clientCode,
      serverCode: result.serverCode,
      documentation: result.documentation,
      examples: result.examples
    } as AIAPIHelperResponse

  } catch (error) {
    console.error('API Helper Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate API integration'
    })
  }
})
