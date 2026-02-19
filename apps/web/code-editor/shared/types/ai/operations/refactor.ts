import type { ResponseBase, Language } from '../../common'

export interface RefactorRequest {
  code: string
  language: Language
  refactorType: 'cleanup' | 'optimize' | 'modernize' | 'extract'
  options?: {
    preserveFormatting?: boolean
    addComments?: boolean
    breakingChanges?: boolean
  }
}

export interface RefactorResponse extends ResponseBase {
  originalCode: string
  refactoredCode: string
  changes: {
    type: string
    description: string
    line?: number
  }[]
  improvements: string[]
}
