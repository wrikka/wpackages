import { createAIRefactorEngine } from '~/server/ai/engines/code/refactor-engine'
import type { AIRefactorRequest, AIRefactorResponse } from '~/shared/types/ai'

const refactorEngine = createAIRefactorEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIRefactorRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await refactorEngine.refactorCode({
      code: body.code,
      language: body.language,
      refactorType: body.refactorType || 'cleanup',
      options: body.options || {}
    })

    return {
      success: true,
      originalCode: body.code,
      refactoredCode: result.code,
      changes: result.changes,
      improvements: result.improvements
    } as AIRefactorResponse

  } catch (error) {
    console.error('AI Refactoring Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to refactor code'
    })
  }
})
