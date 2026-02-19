import type { ResponseBase, Language, PackageManager } from '../../common'

export interface DependencyRequest {
  code: string
  language: Language
  action: 'analyze' | 'update' | 'audit' | 'optimize'
  options?: {
    includeDevDependencies?: boolean
    checkVulnerabilities?: boolean
    suggestUpdates?: boolean
    packageManager?: PackageManager
  }
}

export interface DependencyResponse extends ResponseBase {
  dependencies: {
    name: string
    version: string
    type: 'production' | 'development' | 'peer'
    latest?: string
    vulnerabilities: {
      severity: 'low' | 'medium' | 'high' | 'critical'
      title: string
      description: string
    }[]
    usage: {
      files: string[]
      functions: string[]
    }
  }[]
  recommendations: {
    type: 'update' | 'remove' | 'add' | 'replace'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    code?: string
  }[]
  vulnerabilities: {
    package: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    count: number
    affected: string[]
  }[]
  updates: {
    package: string
    current: string
    latest: string
    type: 'patch' | 'minor' | 'major'
    changelog?: string
  }[]
}
