import { createSecurityScanner } from '~/server/ai/engines/security/security-scanner'
import type { AISecurityRequest, AISecurityResponse } from '~/shared/types/ai'

const securityScanner = createSecurityScanner()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AISecurityRequest>(event)

    if (!body.code || !body.language) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: code, language'
      })
    }

    const result = await securityScanner.scanCode({
      code: body.code,
      language: body.language,
      scanType: body.scanType || 'comprehensive',
      options: body.options || {}
    })

    return {
      success: true,
      vulnerabilities: result.vulnerabilities,
      riskScore: result.riskScore,
      recommendations: result.recommendations,
      compliance: result.compliance
    } as AISecurityResponse

  } catch (error) {
    console.error('Security Scan Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to scan for security issues'
    })
  }
})
