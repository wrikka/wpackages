import { createDependencyManager } from '~/server/ai/engines/dependencies/dependency-manager'
import type { AIDependencyRequest, AIDependencyResponse } from '~/shared/types/ai'

const dependencyManager = createDependencyManager()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIDependencyRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await dependencyManager.analyzeDependencies({
      code: body.code,
      language: body.language,
      action: body.action || 'analyze',
      options: body.options || {}
    })

    return {
      success: true,
      dependencies: result.dependencies,
      recommendations: result.recommendations,
      vulnerabilities: result.vulnerabilities,
      updates: result.updates
    } as AIDependencyResponse

  } catch (error) {
    console.error('Dependency Manager Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to analyze dependencies'
    })
  }
})
