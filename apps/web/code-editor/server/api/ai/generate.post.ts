import { createAIEngine } from '~/server/ai/core/engine'
import type { AIGenerateRequest, AIGenerateResponse } from '~/shared/types/ai'

const aiEngine = createAIEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIGenerateRequest>(event)

    // Validate request
    if (!body.prompt || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: prompt, language'
      })
    }

    // Generate code using AI
    const result = await aiEngine.generateCode({
      prompt: body.prompt,
      language: body.language,
      context: body.context,
      temperature: body.temperature || 0.7,
      maxTokens: body.maxTokens || 2000
    })

    return {
      success: true,
      data: {
        code: result.code,
        explanation: result.explanation,
        confidence: result.confidence,
        tokens: result.tokens
      }
    } as AIGenerateResponse

  } catch (error) {
    console.error('AI Generation Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate code'
    })
  }
})
