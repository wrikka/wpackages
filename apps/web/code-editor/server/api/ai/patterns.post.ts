import { createPatternRecognitionEngine } from '~/server/ai/engines/analysis/pattern-recognition-engine'
import type { AIPatternRequest, AIPatternResponse } from '~/shared/types/ai'

const patternEngine = createPatternRecognitionEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIPatternRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await patternEngine.recognizePatterns({
      code: body.code,
      language: body.language,
      patternType: body.patternType || 'all',
      options: body.options || {}
    })

    return {
      success: true,
      patterns: result.patterns,
      suggestions: result.suggestions,
      refactorings: result.refactorings,
      metrics: result.metrics
    } as AIPatternResponse

  } catch (error) {
    console.error('Pattern Recognition Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to recognize patterns'
    })
  }
})
