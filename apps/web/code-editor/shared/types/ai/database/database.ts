export interface AIDatabaseRequest {
  code: string
  language: string
  databaseType: 'relational' | 'nosql' | 'document' | 'graph'
  options?: {
    database?: string
    framework?: string
    namingStrategy?: 'snake_case' | 'camelCase' | 'pascal_case'
    includeIndexes?: boolean
    includeRelations?: boolean
    includeTimestamps?: boolean
    includeSoftDeletes?: boolean
  }
}

export interface AIDatabaseResponse {
  success: boolean
  schema: {
    database: string
    type: string
    description: string
    tables: {
      name: string
      columns: {
        name: string
        type: string
        nullable: boolean
        primaryKey: boolean
        unique: boolean
        autoIncrement: boolean
        description: string
      }[]
      relationships: {
        from: string
        to: string
        type: string
        description: string
      }[]
      indexes: {
        name: string
        columns: string[]
        type: string
        unique: boolean
        description: string
      }[]
    }
  }
  migrations: {
    version: string
    description: string
    up: string
    down: string
    code: string
  }
  models: {
    name: string
    table: string
    fields: {
      name: string
      type: string
      nullable: boolean
      unique: boolean
      autoIncrement: boolean
      description: string
    }[]
    relationships: {
      from: string
      to: string
      type: string
      description: string
    }[]
  }
  relationships: {
    from: string
    to: string
    type: string
    description: string
    through: string
  }[]
}
