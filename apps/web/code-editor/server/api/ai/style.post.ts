import { createStyleEnforcerEngine } from '~/server/ai'
import type { AIStyleEnforcerRequest, AIStyleEnforcerResponse } from '~/shared/types/ai'

const styleEnforcerEngine = createStyleEnforcerEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIStyleEnforcerRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await styleEnforcerEngine.enforceStyle({
      code: body.code,
      language: body.language,
      styleType: body.styleType || 'comprehensive',
      options: body.options || {}
    })

    return {
      success: true,
      violations: result.violations,
      score: result.score,
      fixes: result.fixes,
      formattedCode: result.formattedCode
    } as AIStyleEnforcerResponse

  } catch (error) {
    console.error('Style Enforcer Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to enforce code style'
    })
  }
})
