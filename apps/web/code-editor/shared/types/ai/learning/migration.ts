import type { ResponseBase, Language } from '../../common'

export interface MigrationRequest {
  code: string
  fromLanguage: string
  toLanguage: string
  options?: {
    preserveComments?: boolean
    preserveLogic?: boolean
    framework?: string
    targetVersion?: string
    includeTests?: boolean
  }
}

export interface MigrationResponse extends ResponseBase {
  migration: {
    fromLanguage: string
    toLanguage: string
    complexity: 'simple' | 'medium' | 'complex'
    estimatedTime: number
    compatibility: number
  }
  convertedCode: string
  changes: {
    type: 'syntax' | 'library' | 'framework' | 'pattern'
    description: string
    line?: number
    before: string
    after: string
  }[]
  warnings: {
    type: 'syntax' | 'compatibility' | 'performance' | 'manual'
    message: string
    suggestion: string
  }[]
  instructions: {
    setup: string[]
    testing: string[]
    deployment: string[]
    optimization: string[]
  }
}
