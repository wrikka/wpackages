import type { AIStyleEnforcerRequest, AIStyleEnforcerResponse } from '~/shared/types/ai-style-enforcer'
import { detectStyleViolations } from './detectors'
import { formatCode } from './formatters'
import { calculateStyleScore } from './scorers'

export function createStyleEnforcerEngine() {
  return {
    async enforceStyle(request: AIStyleEnforcerRequest): Promise<Omit<AIStyleEnforcerResponse, 'success'>> {
      const violations = await detectStyleViolations(request)
      const score = calculateStyleScore(violations)
      const fixes = await generateFixes(request, violations)
      const formattedCode = await formatCode(request, violations)

      return {
        violations,
        score,
        fixes,
        formattedCode
      }
    }
  })
}

async function generateFixes(request: AIStyleEnforcerRequest, violations: any[]) {
  const { code, language, styleType } = request
  const fixes = []

  violations.forEach(violation => {
    switch (violation.type) {
      case 'formatting':
        fixes.push(generateFormattingFix(violation, language))
        break
      case 'naming':
        fixes.push(generateNamingFix(violation, language))
        break
      case 'structure':
        fixes.push(generateStructureFix(violation, language))
        break
      case 'best-practices':
        fixes.push(generateBestPracticeFix(violation, language))
        break
    }
  })

  return fixes
}

function generateFormattingFix(violation: any, language: string) {
  return {
    type: 'formatting',
    description: `Fix formatting issue: ${violation.description}`,
    action: violation.action,
    line: violation.line,
    column: violation.column,
    autoFixable: true,
    replacement: violation.replacement
  }
}

function generateNamingFix(violation: any, language: string) {
  return {
    type: 'naming',
    description: `Fix naming convention: ${violation.description}`,
    action: violation.action,
    line: violation.line,
    column: violation.column,
    autoFixable: true,
    replacement: violation.replacement
  }
}

function generateStructureFix(violation: any, language: string) {
  return {
    type: 'structure',
    description: `Fix structure issue: ${violation.description}`,
    action: violation.action,
    line: violation.line,
    column: violation.column,
    autoFixable: false,
    suggestion: violation.suggestion
  }
}

function generateBestPracticeFix(violation: any, language: string) {
  return {
    type: 'best-practices',
    description: `Fix best practice violation: ${violation.description}`,
    action: violation.action,
    line: violation.line,
    column: violation.column,
    autoFixable: violation.autoFixable || false,
    suggestion: violation.suggestion
  }
}
