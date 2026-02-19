import { createAutocompleteEngine } from '~/server/ai/engines/analysis/analysis-engine'
import type { AIAutocompleteRequest, AIAutocompleteResponse } from '~/shared/types/ai'

const autocompleteEngine = createAutocompleteEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIAutocompleteRequest>(event)

    if (!body.code || !body.language || !body.position) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language, position'
      })
    }

    const result = await autocompleteEngine.generateCompletions({
      code: body.code,
      language: body.language,
      position: body.position,
      context: body.context || '',
      options: body.options || {}
    })

    return {
      success: true,
      completions: result.completions,
      context: result.context,
      suggestions: result.suggestions
    } as AIAutocompleteResponse

  } catch (error) {
    console.error('Autocomplete Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate completions'
    })
  }
})
