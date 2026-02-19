import type { ResponseBase, Language, TestType } from '../../common'

export interface TestRequest {
  code: string
  language: Language
  testType: TestType
}

export interface TestResponse extends ResponseBase {
  tests: {
    name: string
    status: 'pass' | 'fail' | 'skip'
    output?: string
    error?: string
  }[]
  coverage: number
}
