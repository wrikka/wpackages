import type { AIDatabaseRequest, AIDatabaseResponse } from '~/shared/types/ai-database'
import { analyzeDatabaseSchema } from './extractors'
import { generateModels, generateRelationships } from './generators'
import { generateMigrations } from './migrators'

export function createDatabaseSchemaEngine() {
  return {
    async designSchema(request: AIDatabaseRequest): Promise<Omit<AIDatabaseResponse, 'success'>> {
      const schema = await analyzeDatabaseSchema(request)
      const migrations = await generateMigrations(request, schema)
      const models = await generateModels(request, schema)
      const relationships = await generateRelationships(request, schema)

      return {
        schema,
        migrations,
        models,
        relationships
      }
    }
  }
}
