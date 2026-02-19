import type { ResponseBase, Language, Severity } from '../../common'

export interface ErrorFixRequest {
  code: string
  language: Language
  autoFix?: boolean
  errorTypes?: ('syntax' | 'runtime' | 'logic' | 'security')[]
}

export interface ErrorFixResponse extends ResponseBase {
  originalCode: string
  fixedCode: string
  errors: {
    type: string
    severity: Severity
    message: string
    line?: number
    column?: number
    autoFixed: boolean
  }[]
  fixes: {
    type: string
    description: string
    line?: number
    before: string
    after: string
  }[]
  warnings: {
    type: string
    message: string
    line?: number
  }[]
}
