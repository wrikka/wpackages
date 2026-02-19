import { createCoverageAnalysisEngine } from '~/server/ai'
import type { AICoverageRequest, AICoverageResponse } from '~/shared/types/ai'

const coverageEngine = createCoverageAnalysisEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AICoverageRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await coverageEngine.analyzeCoverage({
      code: body.code,
      language: body.language,
      analysisType: body.analysisType || 'comprehensive',
      options: body.options || {}
    })

    return {
      success: true,
      coverage: result.coverage,
      gaps: result.gaps,
      recommendations: result.recommendations,
      metrics: result.metrics
    } as AICoverageResponse

  } catch (error) {
    console.error('Coverage Analysis Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to analyze test coverage'
    })
  }
})
