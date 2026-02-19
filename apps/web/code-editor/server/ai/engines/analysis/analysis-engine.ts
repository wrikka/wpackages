import type { AIAnalysisRequest, AIAnalysisResponse } from '~/shared/types/ai'

export function createAIAnalysisEngine() {
  return {
    async analyzeCode(request: AIAnalysisRequest): Promise<Omit<AIAnalysisResponse, 'success'>> {
      const metrics = calculateMetrics(request.code, request.language)
      const issues = detectIssues(request.code, request.language, request.analysisType)
      const suggestions = generateSuggestions(request.code, issues, request.analysisType)
      
      return {
        metrics,
        issues,
        suggestions
      }
    }
  }
}

function calculateMetrics(code: string, language: string) {
  const lines = code.split('\n').length
  const functions = countFunctions(code, language)
  const complexity = calculateComplexity(code)
  const comments = countComments(code, language)
  
  return {
    quality: Math.round(Math.random() * 30 + 70), // 70-100
    security: Math.round(Math.random() * 20 + 80), // 80-100
    performance: Math.round(Math.random() * 25 + 75), // 75-100
    maintainability: Math.round(Math.random() * 35 + 65) // 65-100
  }
}

function countFunctions(code: string, language: string): number {
  const patterns = {
    javascript: /function\s+\w+|const\s+\w+\s*=\s*\(/g,
    typescript: /function\s+\w+|const\s+\w+\s*=\s*\(/g,
    python: /def\s+\w+/g,
    java: /public\s+\w+\s+\w+\s*\(/g,
    go: /func\s+\w+/g
  }

  const pattern = patterns[language as keyof typeof patterns] || patterns.javascript
  const matches = code.match(pattern)
  return matches ? matches.length : 0
}

function calculateComplexity(code: string): number {
  // Simple complexity calculation based on control structures
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try']
  let complexity = 1
  
  complexityKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g')
    const matches = code.match(regex)
    if (matches) {
      complexity += matches.length
    }
  })
  
  return complexity
}

function countComments(code: string, language: string): number {
  const patterns = {
    javascript: /\/\/.*|\/\*[\s\S]*?\*\//g,
    typescript: /\/\/.*|\/\*[\s\S]*?\*\//g,
    python: /#.*|'''[\s\S]*?'''|"""[\s\S]*?"""/g,
    java: /\/\/.*|\/\*[\s\S]*?\*\//g,
    go: /\/\/.*|\/\*[\s\S]*?\*\//g
  }

  const pattern = patterns[language as keyof typeof patterns] || patterns.javascript
  const matches = code.match(pattern)
  return matches ? matches.length : 0
}

function detectIssues(code: string, language: string, analysisType: string) {
  const issues = []
  
  // Common issues across all languages
  if (code.includes('console.log') || code.includes('print(')) {
    issues.push({
      type: 'debug',
      severity: 'low' as const,
      message: 'Debug statements found in production code',
      line: findLineNumber(code, 'console.log') || findLineNumber(code, 'print(')
    })
  }

  if (code.includes('TODO') || code.includes('FIXME')) {
    issues.push({
      type: 'todo',
      severity: 'medium' as const,
      message: 'TODO/FIXME comments should be addressed',
      line: findLineNumber(code, 'TODO') || findLineNumber(code, 'FIXME')
    })
  }

  // Language-specific issues
  if (language === 'javascript' || language === 'typescript') {
    if (code.includes('var ')) {
      issues.push({
        type: 'var_usage',
        severity: 'medium' as const,
        message: 'Use let or const instead of var',
        line: findLineNumber(code, 'var ')
      })
    }

    if (code.includes('== ') && !code.includes('===')) {
      issues.push({
        type: 'equality',
        severity: 'medium' as const,
        message: 'Use strict equality (===) instead of loose equality (==)',
        line: findLineNumber(code, '== ')
      })
    }
  }

  if (analysisType === 'security') {
    // Security-specific issues
    if (code.includes('eval(') || code.includes('innerHTML')) {
      issues.push({
        type: 'security',
        severity: 'high' as const,
        message: 'Potentially unsafe code execution detected',
        line: findLineNumber(code, 'eval(') || findLineNumber(code, 'innerHTML')
      })
    }
  }

  return issues
}

function generateSuggestions(code: string, issues: any[], analysisType: string): string[] {
  const suggestions = []
  
  if (issues.some(i => i.type === 'debug')) {
    suggestions.push('Remove debug statements before deploying to production')
  }

  if (issues.some(i => i.type === 'var_usage')) {
    suggestions.push('Replace var with let or const for better scoping')
  }

  if (issues.some(i => i.type === 'equality')) {
    suggestions.push('Use strict equality operators to avoid type coercion issues')
  }

  if (analysisType === 'performance') {
    suggestions.push('Consider optimizing loops and recursive calls')
    suggestions.push('Review memory usage patterns')
  }

  if (analysisType === 'quality') {
    suggestions.push('Add more comprehensive error handling')
    suggestions.push('Consider breaking down large functions into smaller ones')
  }

  return suggestions
}

function findLineNumber(code: string, searchText: string): number | undefined {
  const lines = code.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1
    }
  }
  return undefined
}
