import type { AIDatabaseRequest } from '~/shared/types/ai-database'

export async function analyzeDatabaseSchema(request: AIDatabaseRequest) {
  const { code, language, databaseType, options } = request

  // Extract database structure from code
  const tables = extractTables(code, language)
  const relationships = extractRelationships(code, language)
  const indexes = extractIndexes(code, language)

  const database = options?.database || 'myapp'
  const description = `AI-generated ${databaseType} database schema for ${language}`

  return {
    database,
    type: databaseType,
    description,
    tables,
    relationships,
    indexes
  }
}

function extractTables(code: string, language: string) {
  const tables = []

  if (language === 'javascript' || language === 'typescript') {
    // Look for table/class definitions
    const classMatches = code.match(/(?:class|const|let)\s+(\w+)\s*(?:extends\s+\w+)?\s*\{[\s\S]*?\}/g) || []
    
    classMatches.forEach(match => {
      const className = match.match(/(?:class|const|let)\s+(\w+)/)?.[1]
      if (className && isLikelyTable(className, match)) {
        const fields = extractFieldsFromClass(match)
        tables.push({
          name: className,
          fields,
          constraints: extractConstraints(match)
        })
      }
    })

    // Look for Drizzle/Prisma schema definitions
    const schemaMatches = code.match(/(?:table|model)\s+(\w+)\s*\{[^}]*\}/g) || []
    schemaMatches.forEach(match => {
      const tableName = match.match(/(?:table|model)\s+(\w+)/)?.[1]
      if (tableName) {
        const fields = extractFieldsFromSchema(match)
        tables.push({
          name: tableName,
          fields,
          constraints: extractConstraintsFromSchema(match)
        })
      }
    })
  }

  if (language === 'python') {
    // Look for SQLAlchemy models
    const classMatches = code.match(/class\s+(\w+)\s*\([^)]*Base[^)]*\)\s*:[^}]*?(?=class|\Z)/g) || []
    classMatches.forEach(match => {
      const className = match.match(/class\s+(\w+)/)?.[1]
      if (className) {
        const fields = extractFieldsFromSQLAlchemy(match)
        tables.push({
          name: className,
          fields,
          constraints: extractConstraintsFromSQLAlchemy(match)
        })
      }
    })
  }

  return tables
}

function extractRelationships(code: string, language: string) {
  const relationships = []

  if (language === 'javascript' || language === 'typescript') {
    // Look for foreign key references
    const fkMatches = code.match(/(?:references|ref|foreignKey)\s*:\s*['"`]([^'"`]+)['"`]/g) || []
    fkMatches.forEach(match => {
      const refTable = match.match(/['"`]([^'"`]+)['"`]/)?.[1]
      if (refTable) {
        relationships.push({
          type: 'foreign-key',
          from: 'unknown', // Would need more context to determine
          to: refTable,
          description: `Foreign key reference to ${refTable}`
        })
      }
    })

    // Look for relationship decorators/annotations
    const relMatches = code.match(/@(?:OneToOne|OneToMany|ManyToOne|ManyToMany)\s*\(\s*\([^)]*\)\s*\)/g) || []
    relMatches.forEach(match => {
      const targetEntity = match.match(/entity\s*:\s*(\w+)/)?.[1] || 
                          match.match(/(\w+)\s*\)/)?.[1]
      if (targetEntity) {
        const relationType = match.match(/@(OneToOne|OneToMany|ManyToOne|ManyToMany)/)?.[1]
        relationships.push({
          type: relationType?.toLowerCase() || 'relationship',
          from: 'unknown',
          to: targetEntity,
          description: `${relationType} relationship with ${targetEntity}`
        })
      }
    })
  }

  return relationships
}

function extractIndexes(code: string, language: string) {
  const indexes = []

  if (language === 'javascript' || language === 'typescript') {
    // Look for index definitions
    const indexMatches = code.match(/(?:index|Index)\s*\(\s*\{[^}]*\}/g) || []
    indexMatches.forEach(match => {
      const fields = match.match(/fields?\s*:\s*\[([^\]]+)\]/)?.[1] || 
                   match.match(/on\s*:\s*['"`]([^'"`]+)['"`]/)?.[1]
      const indexType = match.match(/type\s*:\s*['"`]([^'"`]+)['"`]/)?.[1] || 'btree'
      
      if (fields) {
        indexes.push({
          name: `idx_${fields.replace(/['"\s,]/g, '_')}`,
          fields: fields.split(',').map(f => f.trim().replace(/['"]/g, '')),
          type: indexType,
          unique: match.includes('unique')
        })
      }
    })
  }

  return indexes
}

function isLikelyTable(className: string, classCode: string): boolean {
  const tableIndicators = ['id', 'created_at', 'updated_at', 'deleted_at', 'uuid', 'primary']
  const fieldIndicators = ['string', 'number', 'date', 'boolean', 'text', 'integer']
  
  return tableIndicators.some(indicator => 
    classCode.toLowerCase().includes(indicator)
  ) || fieldIndicators.some(indicator => 
    classCode.toLowerCase().includes(indicator)
  )
}

function extractFieldsFromClass(classCode: string) {
  const fields = []
  
  // Extract property definitions
  const propMatches = classCode.match(/(?:@?\w+\s*)?(\w+)\s*:\s*(\w+)(?:<[^>]*>)?\s*(?:=\s*[^;]+)?;/g) || []
  propMatches.forEach(match => {
    const fieldMatch = match.match(/(\w+)\s*:\s*(\w+)/)
    if (fieldMatch) {
      const [, name, type] = fieldMatch
      fields.push({
        name,
        type: mapTypeToDatabase(type),
        nullable: match.includes('?') || match.includes('undefined'),
        primary: name.toLowerCase().includes('id'),
        unique: match.includes('unique')
      })
    }
  })

  return fields
}

function extractFieldsFromSchema(schemaCode: string) {
  const fields = []
  
  // Extract field definitions from schema
  const fieldMatches = schemaCode.match(/(\w+)\s*:\s*(\w+)(?:\([^)]*\))?(?:\s*\.\s*\w+\([^)]*\))?/g) || []
  fieldMatches.forEach(match => {
    const fieldMatch = match.match(/(\w+)\s*:\s*(\w+)/)
    if (fieldMatch) {
      const [, name, type] = fieldMatch
      fields.push({
        name,
        type: mapTypeToDatabase(type),
        nullable: !match.includes('.notNull()'),
        primary: match.includes('.primaryKey()'),
        unique: match.includes('.unique()')
      })
    }
  })

  return fields
}

function extractFieldsFromSQLAlchemy(classCode: string) {
  const fields = []
  
  // Extract Column definitions
  const columnMatches = classCode.match(/(\w+)\s*=\s*Column\([^)]+\)/g) || []
  columnMatches.forEach(match => {
    const fieldMatch = match.match(/(\w+)\s*=/)
    const typeMatch = match.match(/(?:Integer|String|Text|Boolean|DateTime|Float)\([^)]*\)/)
    
    if (fieldMatch && typeMatch) {
      const [, name] = fieldMatch
      const type = typeMatch[0]
      fields.push({
        name,
        type: mapSQLAlchemyType(type),
        nullable: match.includes('nullable=True'),
        primary: match.includes('primary_key=True'),
        unique: match.includes('unique=True')
      })
    }
  })

  return fields
}

function extractConstraints(classCode: string) {
  const constraints = []

  if (classCode.includes('@Entity')) {
    constraints.push({ type: 'entity', name: 'table' })
  }

  if (classCode.includes('primary') || classCode.includes('primaryKey')) {
    constraints.push({ type: 'primary', fields: ['id'] })
  }

  return constraints
}

function extractConstraintsFromSchema(schemaCode: string) {
  const constraints = []

  if (schemaCode.includes('.primaryKey()')) {
    constraints.push({ type: 'primary', fields: ['id'] })
  }

  if (schemaCode.includes('.unique()')) {
    constraints.push({ type: 'unique', fields: [] })
  }

  return constraints
}

function extractConstraintsFromSQLAlchemy(classCode: string) {
  const constraints = []

  if (classCode.includes('primary_key=True')) {
    constraints.push({ type: 'primary', fields: ['id'] })
  }

  if (classCode.includes('unique=True')) {
    constraints.push({ type: 'unique', fields: [] })
  }

  return constraints
}

function mapTypeToDatabase(type: string): string {
  const typeMap = {
    'string': 'VARCHAR',
    'number': 'INTEGER',
    'boolean': 'BOOLEAN',
    'date': 'TIMESTAMP',
    'text': 'TEXT',
    'integer': 'INTEGER',
    'float': 'FLOAT',
    'double': 'DOUBLE'
  }

  return typeMap[type.toLowerCase()] || 'VARCHAR'
}

function mapSQLAlchemyType(sqlType: string): string {
  if (sqlType.includes('String') || sqlType.includes('Text')) return 'VARCHAR'
  if (sqlType.includes('Integer')) return 'INTEGER'
  if (sqlType.includes('Boolean')) return 'BOOLEAN'
  if (sqlType.includes('DateTime')) return 'TIMESTAMP'
  if (sqlType.includes('Float')) return 'FLOAT'
  
  return 'VARCHAR'
}
