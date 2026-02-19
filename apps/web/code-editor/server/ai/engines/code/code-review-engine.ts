import type { AICodeReviewRequest, AICodeReviewResponse } from '~/shared/types/ai'

export function createCodeReviewEngine() {
  return {
    async reviewCode(request: AICodeReviewRequest): Promise<Omit<AICodeReviewResponse, 'success'>> {
      const issues = []
      const suggestions = []
      const reviewDetails = []
      
      // Analyze different aspects based on review type
      switch (request.reviewType) {
        case 'comprehensive':
          reviewDetails.push(...await performComprehensiveReview(request.code, request.language, issues, suggestions))
          break
        case 'security':
          reviewDetails.push(...await performSecurityReview(request.code, request.language, issues))
          break
        case 'performance':
          reviewDetails.push(...await performPerformanceReview(request.code, request.language, issues, suggestions))
          break
        case 'style':
          reviewDetails.push(...await performStyleReview(request.code, request.language, issues))
          break
        case 'best-practices':
          reviewDetails.push(...await performBestPracticesReview(request.code, request.language, issues, suggestions))
          break
      }

      const scores = calculateReviewScores(reviewDetails, request.options?.strictness || 'medium')
      const approval = determineApproval(scores, issues, request.options?.strictness || 'medium')
      
      return {
        review: {
          summary: generateReviewSummary(scores, issues.length),
          details: reviewDetails
        },
        score: scores,
        issues,
        suggestions,
        approval
      }
    }
  }
}

async function performComprehensiveReview(code: string, language: string, issues: any[], suggestions: any[]) {
  const details = []
  
  // Style Review
  const styleResults = await performStyleReview(code, language, issues)
  details.push(styleResults)
  
  // Security Review
  const securityResults = await performSecurityReview(code, language, issues)
  details.push(securityResults)
  
  // Performance Review
  const performanceResults = await performPerformanceReview(code, language, issues, suggestions)
  details.push(performanceResults)
  
  // Best Practices Review
  const bestPracticesResults = await performBestPracticesReview(code, language, issues, suggestions)
  details.push(bestPracticesResults)
  
  return details
}

async function performStyleReview(code: string, language: string, issues: any[]) {
  const findings = []
  let score = 100
  
  // Check naming conventions
  if (language === 'javascript' || language === 'typescript') {
    // Check for camelCase
    const camelCaseViolations = code.match(/\b[A-Z][a-z]+[A-Z][a-z]*\b/g) || []
    camelCaseViolations.forEach((violation, index) => {
      const line = findLineNumber(code, violation)
      issues.push({
        type: 'style',
        severity: 'warning',
        message: `Naming convention violation: '${violation}' should use camelCase`,
        line,
        suggestion: `Rename to camelCase format`
      })
      score -= 5
    })
    
    if (camelCaseViolations.length > 0) {
      findings.push(`${camelCaseViolations.length} naming convention violations found`)
    }
  }
  
  // Check line length
  const lines = code.split('\n')
  const longLines = lines.filter(line => line.length > 100)
  if (longLines.length > 0) {
    findings.push(`${longLines.length} lines exceed 100 characters`)
    score -= longLines.length * 2
  }
  
  // Check for missing semicolons (JS/TS)
  if (language === 'javascript' || language === 'typescript') {
    const linesWithoutSemicolons = lines.filter(line => 
      line.trim() && 
      !line.trim().endsWith(';') && 
      !line.trim().endsWith('{') && 
      !line.trim().endsWith('}') &&
      !line.includes('if') &&
      !line.includes('for') &&
      !line.includes('while') &&
      !line.includes('function')
    )
    
    if (linesWithoutSemicolons.length > 0) {
      findings.push(`${linesWithoutSemicolons.length} lines missing semicolons`)
      score -= linesWithoutSemicolons.length * 3
    }
  }
  
  return {
    category: 'Style',
    score: Math.max(0, score),
    findings
  }
}

async function performSecurityReview(code: string, language: string, issues: any[]) {
  const findings = []
  let score = 100
  
  // Check for common security vulnerabilities
  const securityPatterns = [
    {
      pattern: /eval\s*\(/g,
      type: 'critical',
      message: 'Use of eval() detected - potential security risk',
      suggestion: 'Use safer alternatives like JSON.parse() or function constructors'
    },
    {
      pattern: /innerHTML\s*=/g,
      type: 'high',
      message: 'Direct innerHTML assignment - XSS vulnerability',
      suggestion: 'Use textContent or sanitize HTML before assignment'
    },
    {
      pattern: /document\.write\s*\(/g,
      type: 'high',
      message: 'Use of document.write() - security risk',
      suggestion: 'Use DOM manipulation methods instead'
    },
    {
      pattern: /setTimeout\s*\(\s*["']/g,
      type: 'medium',
      message: 'setTimeout with string argument - security risk',
      suggestion: 'Use function reference instead of string'
    },
    {
      pattern: /Function\s*\(/g,
      type: 'medium',
      message: 'Function constructor usage - potential security risk',
      suggestion: 'Use regular function declarations or arrow functions'
    }
  ]
  
  securityPatterns.forEach(({ pattern, type, message, suggestion }) => {
    const matches = code.match(pattern)
    if (matches) {
      findings.push(`${matches.length} ${type} security issue(s): ${message}`)
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        issues.push({
          type: 'security',
          severity: type,
          message,
          line,
          suggestion
        })
      })
      
      // Reduce score based on severity
      const scoreReduction = {
        critical: 20,
        high: 15,
        medium: 10,
        low: 5
      }
      score -= (scoreReduction[type as keyof typeof scoreReduction] || 5) * matches.length
    }
  })
  
  // Check for hardcoded secrets
  const secretPatterns = [
    /password\s*=\s*["'][^"']+["']/gi,
    /api[_-]?key\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
    /token\s*=\s*["'][^"']+["']/gi
  ]
  
  secretPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      findings.push(`${matches.length} hardcoded credentials detected`)
      score -= matches.length * 15
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        issues.push({
          type: 'security',
          severity: 'critical',
          message: 'Hardcoded credential detected',
          line,
          suggestion: 'Move credentials to environment variables'
        })
      })
    }
  })
  
  return {
    category: 'Security',
    score: Math.max(0, score),
    findings
  }
}

async function performPerformanceReview(code: string, language: string, issues: any[], suggestions: any[]) {
  const findings = []
  let score = 100
  
  // Check for performance anti-patterns
  const performancePatterns = [
    {
      pattern: /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*(\w+)\.length;\s*i\+\+\s*\)/g,
      message: 'Inefficient loop - recalculating array.length',
      suggestion: 'Cache array.length before loop',
      improvement: 'Cache length property'
    },
    {
      pattern: /document\.getElementById\s*\(/g,
      message: 'Repeated DOM queries',
      suggestion: 'Cache DOM element references',
      improvement: 'Cache DOM queries'
    },
    {
      pattern: /console\.log\s*\(/g,
      message: 'Debug statements in production code',
      suggestion: 'Remove console.log statements',
      improvement: 'Remove debug code'
    }
  ]
  
  performancePatterns.forEach(({ pattern, message, suggestion, improvement }) => {
    const matches = code.match(pattern)
    if (matches) {
      findings.push(`${matches.length} performance issue(s): ${message}`)
      score -= matches.length * 5
      
      suggestions.push({
        type: 'performance',
        message,
        code: generateSuggestionCode(message, language),
        impact: 'medium'
      })
    }
  })
  
  // Check for memory leaks
  if (code.includes('addEventListener') && !code.includes('removeEventListener')) {
    findings.push('Event listeners added without removal - potential memory leak')
    score -= 10
    issues.push({
      type: 'performance',
      severity: 'warning',
      message: 'Event listeners not properly removed',
      suggestion: 'Add removeEventListener calls'
    })
  }
  
  return {
    category: 'Performance',
    score: Math.max(0, score),
    findings
  }
}

async function performBestPracticesReview(code: string, language: string, issues: any[], suggestions: any[]) {
  const findings = []
  let score = 100
  
  // Check for best practices violations
  const bestPracticePatterns = [
    {
      pattern: /var\s+/g,
      message: 'Use of var instead of let/const',
      suggestion: 'Replace var with let or const'
    },
    {
      pattern: /==\s/g,
      message: 'Use of loose equality (==)',
      suggestion: 'Use strict equality (===)'
    },
    {
      pattern: /new\s+Array\s*\(/g,
      message: 'Use of Array constructor',
      suggestion: 'Use array literal syntax []'
    },
    {
      pattern: /new\s+Object\s*\(/g,
      message: 'Use of Object constructor',
      suggestion: 'Use object literal syntax {}'
    }
  ]
  
  bestPracticePatterns.forEach(({ pattern, message, suggestion }) => {
    const matches = code.match(pattern)
    if (matches) {
      findings.push(`${matches.length} best practice violation(s): ${message}`)
      score -= matches.length * 3
    }
  })
  
  // Check for error handling
  const hasTryCatch = code.includes('try') && code.includes('catch')
  const hasAsyncAwait = code.includes('async') || code.includes('await')
  
  if (hasAsyncAwait && !hasTryCatch) {
    findings.push('Async/await without error handling')
    score -= 10
    issues.push({
      type: 'best-practices',
      severity: 'warning',
      message: 'Async operations lack error handling',
      suggestion: 'Add try/catch blocks for async operations'
    })
  }
  
  // Check for function complexity
  const functions = code.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []
  if (functions.length > 0) {
    const avgComplexity = calculateAverageComplexity(code)
    if (avgComplexity > 10) {
      findings.push('High function complexity detected')
      score -= 15
      suggestions.push({
        type: 'best-practices',
        message: 'Consider breaking down complex functions',
        code: '// Split large functions into smaller, focused functions',
        impact: 'high'
      })
    }
  }
  
  return {
    category: 'Best Practices',
    score: Math.max(0, score),
    findings
  }
}

function calculateReviewScores(details: any[], strictness: string) {
  const categoryScores = {
    style: 100,
    security: 100,
    performance: 100,
    maintainability: 100,
    best_practices: 100
  }
  
  details.forEach(detail => {
    const categoryKey = detail.category.toLowerCase().replace(' ', '_') as keyof typeof categoryScores
    if (categoryScores[categoryKey] !== undefined) {
      categoryScores[categoryKey] = Math.min(categoryScores[categoryKey], detail.score)
    }
  })
  
  // Apply strictness multiplier
  const strictnessMultiplier = {
    low: 0.8,
    medium: 1.0,
    high: 1.2
  }
  
  const multiplier = strictnessMultiplier[strictness as keyof typeof strictnessMultiplier]
  
  Object.keys(categoryScores).forEach(key => {
    categoryScores[key as keyof typeof categoryScores] = Math.round(
      categoryScores[key as keyof typeof categoryScores] * multiplier
    )
  })
  
  const overall = Math.round(
    Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length
  )
  
  return {
    overall,
    categories: categoryScores
  }
}

function determineApproval(scores: any, issues: any[], strictness: string) {
  const thresholds = {
    low: { overall: 60, critical: 5, high: 10 },
    medium: { overall: 75, critical: 2, high: 5 },
    high: { overall: 85, critical: 0, high: 2 }
  }
  
  const threshold = thresholds[strictness as keyof typeof thresholds]
  const criticalIssues = issues.filter(i => i.severity === 'critical').length
  const highIssues = issues.filter(i => i.severity === 'high').length
  
  const approved = scores.overall >= threshold.overall && 
                 criticalIssues <= threshold.critical && 
                 highIssues <= threshold.high
  
  const confidence = Math.min(100, Math.round((scores.overall / 100) * 100))
  
  const requirements = []
  if (scores.overall < threshold.overall) {
    requirements.push(`Improve overall code quality to ${threshold.overall}+`)
  }
  if (criticalIssues > threshold.critical) {
    requirements.push(`Fix all critical security issues`)
  }
  if (highIssues > threshold.high) {
    requirements.push(`Reduce high severity issues to ${threshold.high} or fewer`)
  }
  
  return {
    approved,
    confidence,
    requirements
  }
}

function generateReviewSummary(scores: any, issueCount: number) {
  const overall = scores.overall
  let summary = ''
  
  if (overall >= 90) {
    summary = 'Excellent code quality with minimal issues'
  } else if (overall >= 80) {
    summary = 'Good code quality with some minor improvements needed'
  } else if (overall >= 70) {
    summary = 'Acceptable code quality requiring several improvements'
  } else if (overall >= 60) {
    summary = 'Code quality needs significant improvements'
  } else {
    summary = 'Code quality requires major refactoring'
  }
  
  summary += `. Found ${issueCount} issues across ${Object.keys(scores.categories).length} review categories.`
  
  return summary
}

function calculateAverageComplexity(code: string) {
  // Simplified complexity calculation
  const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try']
  let totalComplexity = 0
  const functions = code.split(/function\s+\w+|const\s+\w+\s*=\s*\(/)
  
  functions.forEach(func => {
    let complexity = 1
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      const matches = func.match(regex)
      if (matches) {
        complexity += matches.length
      }
    })
    totalComplexity += complexity
  })
  
  return functions.length > 0 ? totalComplexity / functions.length : 0
}

function generateSuggestionCode(message: string, language: string) {
  const suggestions = {
    'Cache length property': language === 'javascript' || language === 'typescript' 
      ? 'const len = array.length;\nfor (let i = 0; i < len; i++) { ... }'
      : '// Cache array length before loop',
    'Cache DOM queries': 'const element = document.getElementById("id");\n// Use cached element',
    'Remove debug code': '// Remove console.log statements in production'
  }
  
  return suggestions[message as keyof typeof suggestions] || '// Suggested improvement'
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
