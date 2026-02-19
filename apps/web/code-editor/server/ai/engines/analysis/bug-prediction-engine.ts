import type { AIBugPredictionRequest, AIBugPredictionResponse } from '~/shared/types/ai-bug-prediction'

export function createBugPredictionEngine() {
  return {
    async predictBugs(request: AIBugPredictionRequest): Promise<Omit<AIBugPredictionResponse, 'success'>> {
      const predictions = await generatePredictions(request)
      const riskScore = calculateRiskScore(predictions)
      const recommendations = await generateRecommendations(request, predictions)
      const metrics = calculateMetrics(predictions)

      return {
        predictions,
        riskScore,
        recommendations,
        metrics
      }
    }
  }
}

async function generatePredictions(request: AIBugPredictionRequest) {
  const predictions = []
  const { code, language, predictionType } = request

  switch (predictionType) {
    case 'comprehensive':
      predictions.push(...await predictSecurityBugs(code, language))
      predictions.push(...await predictPerformanceBugs(code, language))
      predictions.push(...await predictLogicBugs(code, language))
      predictions.push(...await predictSyntaxBugs(code, language))
      break
    case 'security':
      predictions.push(...await predictSecurityBugs(code, language))
      break
    case 'performance':
      predictions.push(...await predictPerformanceBugs(code, language))
      break
    case 'logic':
      predictions.push(...await predictLogicBugs(code, language))
      break
    case 'syntax':
      predictions.push(...await predictSyntaxBugs(code, language))
      break
  }

  return predictions
}

async function predictSecurityBugs(code: string, language: string) {
  const predictions = []

  // SQL Injection
  const sqlPatterns = [
    /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\+/gi,
    /mysql_query\s*\(/gi,
    /pg_query\s*\(/gi
  ]

  sqlPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'SQL Injection',
        severity: 'critical',
        confidence: 0.9,
        description: 'Potential SQL injection vulnerability detected',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Use parameterized queries or prepared statements',
        examples: [
          'Bad: "SELECT * FROM users WHERE id = " + userId',
          'Good: "SELECT * FROM users WHERE id = ?"'
        ]
      })
    }
  })

  // XSS Vulnerabilities
  const xssPatterns = [
    /innerHTML\s*=/gi,
    /document\.write\s*\(/gi,
    /eval\s*\(/gi,
    /outerHTML\s*=/gi
  ]

  xssPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Cross-Site Scripting',
        severity: 'critical',
        confidence: 0.85,
        description: 'Potential XSS vulnerability detected',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Use textContent or sanitize HTML before assignment',
        examples: [
          'Bad: element.innerHTML = userInput',
          'Good: element.textContent = userInput'
        ]
      })
    }
  })

  // Hardcoded Secrets
  const secretPatterns = [
    /password\s*=\s*["'][^"']+["']/gi,
    /api[_-]?key\s*=\s*["'][^"']+["']/gi,
    /secret\s*=\s*["'][^"']+["']/gi,
    /token\s*=\s*["'][^"']+["']/gi
  ]

  secretPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Hardcoded Credentials',
        severity: 'critical',
        confidence: 0.95,
        description: 'Hardcoded secrets detected in source code',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Move secrets to environment variables or secure configuration',
        examples: [
          'Bad: const apiKey = "sk-1234567890"',
          'Good: const apiKey = process.env.API_KEY'
        ]
      })
    }
  })

  // Path Traversal
  const pathPatterns = [
    /\.\.\/|\.\.\\/gi,
    /readFile\s*\([^)]*\.\./gi,
    /fs\.readFileSync\s*\([^)]*\.\./gi
  ]

  pathPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Path Traversal',
        severity: 'high',
        confidence: 0.7,
        description: 'Potential path traversal vulnerability',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Validate and sanitize file paths',
        examples: [
          'Bad: fs.readFileSync("../" + filename)',
          'Good: fs.readFileSync(path.join(__dirname, filename))'
        ]
      })
    }
  })

  return predictions
}

async function predictPerformanceBugs(code: string, language: string) {
  const predictions = []

  // Memory Leaks
  const memoryLeakPatterns = [
    /addEventListener\s*\([^)]*\)[^}]*removeEventListener/gi,
    /setInterval\s*\([^)]*\)[^}]*clearInterval/gi,
    /setTimeout\s*\([^)]*\)[^}]*clearTimeout/gi
  ]

  memoryLeakPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Memory Leak',
        severity: 'high',
        confidence: 0.8,
        description: 'Potential memory leak - event listener or timer not properly cleaned up',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Ensure proper cleanup of event listeners and timers',
        examples: [
          'Bad: element.addEventListener("click", handler)',
          'Good: element.addEventListener("click", handler); // Remember to removeEventListener'
        ]
      })
    }
  })

  // Inefficient Loops
  const loopPatterns = [
    /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*(\w+)\.length;\s*i\+\+\s*\)/gi,
    /while\s*\([^)]*\)\s*\{[^}]*array\.length[^}]*\}/gi
  ]

  loopPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Inefficient Loop',
        severity: 'medium',
        confidence: 0.75,
        description: 'Inefficient loop detected - recalculating array length',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Cache array length before loop',
        examples: [
          'Bad: for (let i = 0; i < array.length; i++)',
          'Good: const len = array.length; for (let i = 0; i < len; i++)'
        ]
      })
    }
  })

  // Blocking Operations
  const blockingPatterns = [
    /synchronous.*read|write|execute/gi,
    /readFileSync|writeFileSync|execSync/gi
  ]

  blockingPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Blocking Operation',
        severity: 'medium',
        confidence: 0.7,
        description: 'Synchronous file I/O operation detected',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Use asynchronous alternatives for better performance',
        examples: [
          'Bad: const data = fs.readFileSync("file.txt")',
          'Good: const data = await fs.promises.readFile("file.txt")'
        ]
      })
    }
  })

  return predictions
}

async function predictLogicBugs(code: string, language: string) {
  const predictions = []

  // Null/Undefined Dereference
  const nullPatterns = [
    /(\w+)\.[\w]+\s*&&\s*\1\s*===\s*null/gi,
    /(\w+)\.[\w]+\s*\|\|\s*\1\s*===\s*null/gi,
    /if\s*\(\s*(\w+)\.[\w]+\s*\)/gi
  ]

  nullPatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Null Dereference',
        severity: 'high',
        confidence: 0.8,
        description: 'Potential null/undefined dereference',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Add null checks before property access',
        examples: [
          'Bad: if (user.address.city)',
          'Good: if (user && user.address && user.address.city)'
        ]
      })
    }
  })

  // Off-by-One Errors
  const offByOnePatterns = [
    /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*(\w+)\.length;\s*i\+\+\s*\)\s*\{[^}]*\1\[(\w+)\.length\s*-\s*1\][^}]*\}/gi,
    /(\w+)\[(\w+)\.length\s*-\s*1\]/gi
  ]

  offByOnePatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Off-by-One Error',
        severity: 'high',
        confidence: 0.85,
        description: 'Potential off-by-one error in array access',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Review array bounds and loop conditions',
        examples: [
          'Bad: array[array.length - 1]',
          'Good: array[i] where i < array.length'
        ]
      })
    }
  })

  // Race Conditions
  const racePatterns = [
    /setTimeout\s*\([^)]*\)\s*[^}]*\1\s*=/gi,
    /setInterval\s*\([^)]*\)\s*[^}]*\1\s*=/gi
  ]

  racePatterns.forEach(pattern => {
    const matches = code.match(pattern)
    if (matches) {
      predictions.push({
        type: 'Race Condition',
        severity: 'medium',
        confidence: 0.7,
        description: 'Potential race condition with shared variable',
        location: findBugLocation(code, matches[0]),
        code: matches[0],
        fix: 'Use proper synchronization mechanisms',
        examples: [
          'Bad: setTimeout(() => { sharedVar = newValue }, 100)',
          'Good: Use mutex or atomic operations'
        ]
      })
    }
  })

  return predictions
}

async function predictSyntaxBugs(code: string, language: string) {
  const predictions = []

  // Missing Semicolons (JavaScript/TypeScript)
  if (language === 'javascript' || language === 'typescript') {
    const lines = code.split('\n')
    lines.forEach((line, index) => {
      if (line.trim() && 
          !line.trim().endsWith(';') && 
          !line.trim().endsWith('{') && 
          !line.trim().endsWith('}') &&
          !line.includes('if') &&
          !line.includes('for') &&
          !line.includes('while')) {
        predictions.push({
          type: 'Missing Semicolon',
          severity: 'low',
          confidence: 0.6,
          description: 'Missing semicolon at end of statement',
          location: { line: index + 1, column: line.length },
          code: line,
          fix: 'Add semicolon at end of statement',
          examples: [
            'Bad: const x = 5',
            'Good: const x = 5;'
          ]
        })
      }
    })
  }

  // Unclosed Brackets
  const openBrackets = (code.match(/\{/g) || []).length
  const closeBrackets = (code.match(/\}/g) || []).length
  if (openBrackets !== closeBrackets) {
    predictions.push({
      type: 'Unclosed Brackets',
      severity: 'high',
      confidence: 0.9,
      description: `Mismatched brackets: ${openBrackets > closeBrackets ? 'missing }' : 'extra }'}`,
      location: { line: 1, column: 1 },
      code: code.substring(0, 100),
      fix: 'Balance opening and closing brackets',
      examples: [
        'Bad: function test() { console.log("hello")',
        'Good: function test() { console.log("hello"); }'
      ]
    })
  }

  // Unclosed Parentheses
  const openParens = (code.match(/\(/g) || []).length
  const closeParens = (code.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    predictions.push({
      type: 'Unclosed Parentheses',
      severity: 'high',
      confidence: 0.9,
      description: `Mismatched parentheses: ${openParens > closeParens ? 'missing )' : 'extra )'}`,
      location: { line: 1, column: 1 },
      code: code.substring(0, 100),
      fix: 'Balance opening and closing parentheses',
      examples: [
        'Bad: if (condition && (otherCondition',
        'Good: if (condition && (otherCondition))'
      ]
    })
  }

  return predictions
}

async function generateRecommendations(request: AIBugPredictionRequest, predictions: any[]) {
  const recommendations = []

  // High priority recommendations for critical bugs
  const criticalBugs = predictions.filter(p => p.severity === 'critical')
  if (criticalBugs.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Fix Critical Security Vulnerabilities',
      description: 'Immediate attention required for critical security issues',
      actions: [
        'Review and fix all SQL injection vulnerabilities',
        'Remove hardcoded secrets and use environment variables',
        'Implement proper input validation and sanitization',
        'Add security headers and HTTPS enforcement'
      ]
    })
  }

  // Medium priority recommendations
  const highBugs = predictions.filter(p => p.severity === 'high')
  if (highBugs.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Address High-Impact Issues',
      description: 'Fix high-impact bugs to prevent system failures',
      actions: [
        'Add proper error handling for null/undefined checks',
        'Fix memory leaks by cleaning up event listeners',
        'Review array bounds and loop conditions',
        'Implement proper synchronization for shared resources'
      ]
    })
  }

  // General recommendations
  recommendations.push({
    priority: 'low',
    title: 'Improve Code Quality',
    description: 'General improvements to prevent future bugs',
    actions: [
      'Add comprehensive unit tests',
      'Implement code review process',
      'Use static analysis tools',
      'Add input validation for all user inputs',
      'Document security best practices'
    ]
  })

  return recommendations
}

function calculateRiskScore(predictions: any[]) {
  const severityWeights = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1
  }

  let totalScore = 0
  const categories = {
    security: 0,
    performance: 0,
    logic: 0,
    syntax: 0,
    maintainability: 0
  }

  predictions.forEach(prediction => {
    const weight = severityWeights[prediction.severity as keyof typeof severityWeights]
    totalScore += weight * prediction.confidence

    // Categorize by type
    if (prediction.type.includes('SQL') || prediction.type.includes('XSS') || prediction.type.includes('Secrets')) {
      categories.security += weight * prediction.confidence
    } else if (prediction.type.includes('Memory') || prediction.type.includes('Loop') || prediction.type.includes('Blocking')) {
      categories.performance += weight * prediction.confidence
    } else if (prediction.type.includes('Null') || prediction.type.includes('Race') || prediction.type.includes('Off-by-One')) {
      categories.logic += weight * prediction.confidence
    } else if (prediction.type.includes('Semicolon') || prediction.type.includes('Bracket') || prediction.type.includes('Parentheses')) {
      categories.syntax += weight * prediction.confidence
    } else {
      categories.maintainability += weight * prediction.confidence
    }
  })

  const maxPossibleScore = predictions.length * 10 // Maximum possible score
  const normalizedScore = Math.min(100, (totalScore / maxPossibleScore) * 100)

  return {
    overall: Math.round(normalizedScore),
    categories: {
      security: Math.round((categories.security / maxPossibleScore) * 100),
      performance: Math.round((categories.performance / maxPossibleScore) * 100),
      logic: Math.round((categories.logic / maxPossibleScore) * 100),
      syntax: Math.round((categories.syntax / maxPossibleScore) * 100),
      maintainability: Math.round((categories.maintainability / maxPossibleScore) * 100)
    }
  }
}

function calculateMetrics(predictions: any[]) {
  const totalPredictions = predictions.length
  const criticalCount = predictions.filter(p => p.severity === 'critical').length
  const highCount = predictions.filter(p => p.severity === 'high').length
  const mediumCount = predictions.filter(p => p.severity === 'medium').length
  const lowCount = predictions.filter(p => p.severity === 'low').length

  const averageConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
    : 0

  return {
    totalPredictions,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    averageConfidence: Math.round(averageConfidence * 100) / 100
  }
}

function findBugLocation(code: string, match: string) {
  const lines = code.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(match)) {
      return {
        line: i + 1,
        column: lines[i].indexOf(match) + 1
      }
    }
  }
  return { line: 1, column: 1 }
}
