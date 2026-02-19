import type { ResponseBase, Language } from '../../common'

export interface DocumentationRequest {
  code: string
  language: Language
  docType: 'api' | 'readme' | 'inline' | 'javadoc' | 'jsdoc'
  format: 'markdown' | 'html' | 'json'
  options?: {
    includeExamples?: boolean
    includeTypes?: boolean
    includeTests?: boolean
    style?: 'technical' | 'user-friendly'
  }
}

export interface DocumentationResponse extends ResponseBase {
  documentation: string
  metadata: {
    title: string
    description: string
    version: string
    author?: string
    functions: {
      name: string
      description: string
      parameters: {
        name: string
        type: string
        description: string
        optional: boolean
      }[]
      returns: {
        type: string
        description: string
      }
      examples: string[]
    }[]
  }
  examples: {
    title: string
    code: string
    description: string
  }[]
}
