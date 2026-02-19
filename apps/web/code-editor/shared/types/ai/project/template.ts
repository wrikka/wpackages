import type { ResponseBase, Language, PackageManager } from '../../common'

export interface TemplateRequest {
  templateId: string
  projectName: string
  options?: {
    includeTests?: boolean
    includeDocs?: boolean
    packageManager?: PackageManager
    framework?: string
    styling?: string
    database?: string
  }
}

export interface TemplateResponse extends ResponseBase {
  project: {
    name: string
    type: string
    description: string
    language: Language
  }
  files: {
    path: string
    content: string
    type: 'file' | 'directory'
  }[]
  instructions: {
    setup: string[]
    run: string[]
    test: string[]
    deploy: string[]
  }
}
