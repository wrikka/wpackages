import { createAITestEngine } from '~/server/ai/engines/testing/test-engine'
import type { AITestRequest, AITestResponse } from '~/shared/types/ai'

const testEngine = createAITestEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AITestRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await testEngine.runTests({
      code: body.code,
      language: body.language,
      testType: body.testType || 'unit'
    })

    return {
      success: true,
      tests: result.tests,
      coverage: result.coverage
    } as AITestResponse

  } catch (error) {
    console.error('AI Testing Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to run tests'
    })
  }
})
