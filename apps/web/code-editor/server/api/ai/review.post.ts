import { createCodeReviewEngine } from '~/server/ai/engines/code/code-review-engine'
import type { AICodeReviewRequest, AICodeReviewResponse } from '~/shared/types/ai'

const reviewEngine = createCodeReviewEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AICodeReviewRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await reviewEngine.reviewCode({
      code: body.code,
      language: body.language,
      reviewType: body.reviewType || 'comprehensive',
      options: body.options || {}
    })

    return {
      success: true,
      review: result.review,
      score: result.score,
      issues: result.issues,
      suggestions: result.suggestions,
      approval: result.approval
    } as AICodeReviewResponse

  } catch (error) {
    console.error('Code Review Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to review code'
    })
  }
})
