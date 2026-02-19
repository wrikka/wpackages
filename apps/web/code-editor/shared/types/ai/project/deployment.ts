import type { ResponseBase, Language, Platform } from '../../common'

export interface DeploymentRequest {
  code: string
  language: Language
  platform: Platform
  options?: {
    environment?: 'development' | 'staging' | 'production'
    region?: string
    buildCommand?: string
    startCommand?: string
    nodeVersion?: string
    envVars?: Record<string, string>
    customDomain?: string
  }
}

export interface DeploymentResponse extends ResponseBase {
  deployment: {
    platform: string
    url?: string
    status: 'pending' | 'building' | 'deployed' | 'failed'
    buildTime?: number
    deployTime?: number
    logs: string[]
  }
  scripts: {
    build: string
    deploy: string
    rollback: string
    cleanup: string
  }
  configuration: {
    platform: string
    settings: Record<string, any>
    environment: Record<string, string>
  }
  instructions: {
    setup: string[]
    deploy: string[]
    monitor: string[]
    rollback: string[]
  }
}
