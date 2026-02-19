import { createBugPredictionEngine } from '~/server/ai/bug-prediction-engine'
import type { AIBugPredictionRequest, AIBugPredictionResponse } from '~/shared/types/ai'

const bugPredictionEngine = createBugPredictionEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIBugPredictionRequest>(event)
    
    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await bugPredictionEngine.predictBugs({
      code: body.code,
      language: body.language,
      predictionType: body.predictionType || 'comprehensive',
      options: body.options || {}
    })

    return {
      success: true,
      predictions: result.predictions,
      riskScore: result.riskScore,
      recommendations: result.recommendations,
      metrics: result.metrics
    } as AIBugPredictionResponse

  } catch (error) {
    console.error('Bug Prediction Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to predict bugs'
    })
  }
})
