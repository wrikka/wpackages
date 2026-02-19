import { createDocumentationEngine } from '~/server/ai/engines/documentation/documentation-engine'
import type { AIDocumentationRequest, AIDocumentationResponse } from '~/shared/types/ai'

const docsEngine = createDocumentationEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIDocumentationRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await docsEngine.generateDocumentation({
      code: body.code,
      language: body.language,
      docType: body.docType || 'api',
      format: body.format || 'markdown',
      options: body.options || {}
    })

    return {
      success: true,
      documentation: result.documentation,
      metadata: result.metadata,
      examples: result.examples
    } as AIDocumentationResponse

  } catch (error) {
    console.error('Documentation Generation Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate documentation'
    })
  }
})
