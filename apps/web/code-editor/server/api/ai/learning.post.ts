import { createLearningEngine } from '~/server/ai/engines/learning/learning-engine'
import type { AILearningRequest, AILearningResponse } from '~/shared/types/ai'

const learningEngine = createLearningEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AILearningRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await learningEngine.learnFromCode({
      code: body.code,
      language: body.language,
      learningType: body.learningType || 'patterns',
      options: body.options || {}
    })

    return {
      success: true,
      insights: result.insights,
      patterns: result.patterns,
      improvements: result.improvements,
      recommendations: result.recommendations
    } as AILearningResponse

  } catch (error) {
    console.error('AI Learning Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to learn from code'
    })
  }
})
