import { createDeploymentEngine } from '~/server/ai/engines/deployment/deployment-engine'
import type { AIDeploymentRequest, AIDeploymentResponse } from '~/shared/types/ai'

const deploymentEngine = createDeploymentEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIDeploymentRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await deploymentEngine.generateDeployment({
      code: body.code,
      language: body.language,
      platform: body.platform,
      options: body.options || {}
    })

    return {
      success: true,
      deployment: result.deployment,
      scripts: result.scripts,
      configuration: result.configuration,
      instructions: result.instructions
    } as AIDeploymentResponse

  } catch (error) {
    console.error('Deployment Generation Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate deployment'
    })
  }
})
