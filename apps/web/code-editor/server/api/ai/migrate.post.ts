import { createMigrationEngine } from '~/server/ai/engines/migration/migration-engine'
import type { AIMigrationRequest, AIMigrationResponse } from '~/shared/types/ai'

const migrationEngine = createMigrationEngine()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AIMigrationRequest>(event)

    if (!body.code || !body.fromLanguage || !body.toLanguage) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, fromLanguage, toLanguage'
      })
    }

    const result = await migrationEngine.migrateCode({
      code: body.code,
      fromLanguage: body.fromLanguage,
      toLanguage: body.toLanguage,
      options: body.options || {}
    })

    return {
      success: true,
      migration: result.migration,
      convertedCode: result.convertedCode,
      changes: result.changes,
      warnings: result.warnings,
      instructions: result.instructions
    } as AIMigrationResponse

  } catch (error) {
    console.error('Code Migration Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to migrate code'
    })
  }
})
