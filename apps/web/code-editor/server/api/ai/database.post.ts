import { createDatabaseSchemaEngine } from '~/server/ai'
import type { AIDatabaseRequest, AIDatabaseResponse } from '~/shared/types/ai'

const databaseEngine = createDatabaseSchemaEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIDatabaseRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await databaseEngine.designSchema({
      code: body.code,
      language: body.language,
      databaseType: body.databaseType || 'relational',
      options: body.options || {}
    })

    return {
      success: true,
      schema: result.schema,
      migrations: result.migrations,
      models: result.models,
      relationships: result.relationships
    } as AIDatabaseResponse

  } catch (error) {
    console.error('Database Schema Designer Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to design database schema'
    })
  }
})
