import { createAIAnalysisEngine } from '~/server/ai/engines/analysis/analysis-engine'
import type { AIAnalysisRequest, AIAnalysisResponse } from '~/shared/types/ai'

const analysisEngine = createAIAnalysisEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIAnalysisRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await analysisEngine.analyzeCode({
      code: body.code,
      language: body.language,
      analysisType: body.analysisType || 'quality'
    })

    return {
      success: true,
      metrics: result.metrics,
      issues: result.issues,
      suggestions: result.suggestions
    } as AIAnalysisResponse

  } catch (error) {
    console.error('AI Analysis Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to analyze code'
    })
  }
})
