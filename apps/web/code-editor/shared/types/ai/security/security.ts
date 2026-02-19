import type { ResponseBase, Language, Severity, Priority } from '../../common'

export interface SecurityRequest {
  code: string
  language: Language
  scanType: 'comprehensive' | 'owasp' | 'injection' | 'xss' | 'crypto' | 'auth'
  options?: {
    includeInfo?: boolean
    strictMode?: boolean
    framework?: string
  }
}

export interface SecurityResponse extends ResponseBase {
  vulnerabilities: {
    type: string
    severity: Severity
    title: string
    description: string
    line?: number
    cwe?: string
    owasp?: string
    recommendation: string
    code?: string
  }[]
  riskScore: {
    overall: number
    categories: {
      injection: number
      xss: number
      crypto: number
      auth: number
      config: number
    }
  }
  recommendations: {
    priority: Priority
    title: string
    description: string
    code: string
  }[]
  compliance: {
    owasp: boolean
    sans: boolean
    pci: boolean
    gdpr: boolean
  }
}
