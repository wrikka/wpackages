import type { AIAPIHelperRequest } from '~/shared/types/ai-api-helper'

export async function analyzeAPIIntegration(request: AIAPIHelperRequest) {
  const { code, language, apiType, options } = request

  // Analyze the code to determine API structure
  const apiStructure = analyzeAPIStructure(code, language)
  const endpoints = extractEndpoints(code, language, apiType)
  const authentication = detectAuthentication(code, language)
  const validation = detectValidation(code, language)

  return {
    type: apiType,
    description: `${apiType.toUpperCase()} API integration for ${language}`,
    endpoints,
    authentication,
    validation
  }
}

function analyzeAPIStructure(code: string, language: string) {
  // Simple analysis to detect API patterns
  const structure = {
    hasRouting: false,
    hasControllers: false,
    hasMiddleware: false,
    hasDatabase: false,
    hasValidation: false,
    hasErrorHandling: false
  }

  // Detect patterns based on language
  if (language === 'javascript' || language === 'typescript') {
    structure.hasRouting = /router|route|app\.(get|post|put|delete)/i.test(code)
    structure.hasControllers = /class.*Controller|controller/i.test(code)
    structure.hasMiddleware = /middleware|use\(|app\.use/i.test(code)
    structure.hasDatabase = /db|database|model|schema/i.test(code)
    structure.hasValidation = /validate|validation|joi|yup|zod/i.test(code)
    structure.hasErrorHandling = /try.*catch|error|catch\(/i.test(code)
  }

  return structure
}

function extractEndpoints(code: string, language: string, apiType: string) {
  const endpoints = []

  if (language === 'javascript' || language === 'typescript') {
    // Extract REST endpoints
    if (apiType === 'rest') {
      const routeMatches = code.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g) || []
      routeMatches.forEach(match => {
        const method = match.match(/\.(get|post|put|delete|patch)/)?.[1]?.toUpperCase()
        const path = match.match(/['"`]([^'"`]+)['"`]/)?.[1]
        if (method && path) {
          endpoints.push({ method, path, type: 'rest' })
        }
      })
    }

    // Extract GraphQL endpoints
    if (apiType === 'graphql') {
      const schemaMatches = code.match(/type\s+\w+\s*\{[^}]*\}/g) || []
      schemaMatches.forEach(match => {
        const typeName = match.match(/type\s+(\w+)/)?.[1]
        if (typeName) {
          endpoints.push({ name: typeName, type: 'graphql' })
        }
      })
    }
  }

  return endpoints
}

function detectAuthentication(code: string, language: string) {
  const auth = {
    type: 'none',
    methods: []
  }

  if (language === 'javascript' || language === 'typescript') {
    if (/jwt|jsonwebtoken|bearer/i.test(code)) {
      auth.type = 'jwt'
      auth.methods.push('jwt')
    }
    if (/oauth|passport/i.test(code)) {
      auth.methods.push('oauth')
    }
    if (/basic.*auth|authorization/i.test(code)) {
      auth.methods.push('basic')
    }
    if (/api.*key|apikey/i.test(code)) {
      auth.methods.push('api-key')
    }
  }

  return auth
}

function detectValidation(code: string, language: string) {
  const validation = {
    library: 'none',
    rules: []
  }

  if (language === 'javascript' || language === 'typescript') {
    if (/joi/i.test(code)) {
      validation.library = 'joi'
    } else if (/yup/i.test(code)) {
      validation.library = 'yup'
    } else if (/zod/i.test(code)) {
      validation.library = 'zod'
    }

    // Extract validation rules
    const ruleMatches = code.match(/required|min|max|email|password|pattern/gi) || []
    validation.rules = [...new Set(ruleMatches)]
  }

  return validation
}
