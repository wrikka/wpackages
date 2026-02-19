import { createAIErrorFixEngine } from '~/server/ai/engines/errors/error-fix-engine'
import type { AIErrorFixRequest, AIErrorFixResponse } from '~/shared/types/ai'

const errorFixEngine = createAIErrorFixEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIErrorFixRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await errorFixEngine.detectAndFixErrors({
      code: body.code,
      language: body.language,
      autoFix: body.autoFix !== false
    })

    return {
      success: true,
      originalCode: body.code,
      fixedCode: result.fixedCode,
      errors: result.errors,
      fixes: result.fixes,
      warnings: result.warnings
    } as AIErrorFixResponse

  } catch (error) {
    console.error('AI Error Fix Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fix errors'
    })
  }
})
