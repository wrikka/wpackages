export type Severity = 'low' | 'medium' | 'high' | 'critical' | 'info' | 'warning' | 'error'
export type Priority = 'high' | 'medium' | 'low'
export type Status = 'pending' | 'in_progress' | 'completed' | 'pass' | 'fail' | 'skip'
export type Platform = 'vercel' | 'netlify' | 'github-pages' | 'aws' | 'azure' | 'heroku' | 'docker' | 'kubernetes' | 'custom'
export type Language = string
export type TestType = 'unit' | 'integration' | 'e2e'
export type PackageManager = 'npm' | 'yarn' | 'bun' | 'pnpm'

export interface BaseEntity {
  id?: string
  name?: string
  type?: string
  description?: string
}

export interface ResponseBase {
  success: boolean
}

export interface Issue {
  type: string
  severity: Severity
  message: string
  line?: number
  column?: number
}

export interface Location {
  line?: number
  column?: number
  path?: string
}
