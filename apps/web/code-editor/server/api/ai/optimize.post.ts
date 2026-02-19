import { createAIOptimizeEngine } from '~/server/ai/engines/optimization/optimize-engine'
import type { AIOptimizeRequest, AIOptimizeResponse } from '~/shared/types/ai'

const optimizeEngine = createAIOptimizeEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIOptimizeRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await optimizeEngine.optimizeCode({
      code: body.code,
      language: body.language,
      optimizationType: body.optimizationType || 'performance',
      options: body.options || {}
    })

    return {
      success: true,
      originalCode: body.code,
      optimizedCode: result.optimizedCode,
      improvements: result.improvements,
      metrics: result.metrics,
      benchmarks: result.benchmarks
    } as AIOptimizeResponse

  } catch (error) {
    console.error('AI Optimization Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to optimize code'
    })
  }
})
