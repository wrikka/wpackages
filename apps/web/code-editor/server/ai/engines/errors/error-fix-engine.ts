import type { AIErrorFixRequest, AIErrorFixResponse } from '~/shared/types/ai'

export function createAIErrorFixEngine() {
  return {
    async detectAndFixErrors(request: AIErrorFixRequest): Promise<Omit<AIErrorFixResponse, 'success' | 'originalCode'>> {
      const errors = detectSyntaxErrors(request.code, request.language)
      const runtimeErrors = detectRuntimeErrors(request.code, request.language)
      const logicErrors = detectLogicErrors(request.code, request.language)
      
      const allErrors = [...errors, ...runtimeErrors, ...logicErrors]
      const fixes = request.autoFix ? generateFixes(allErrors, request.code, request.language) : []
      const fixedCode = applyFixes(request.code, fixes)
      const warnings = generateWarnings(fixedCode, request.language)

      return {
        fixedCode,
        errors: allErrors.map(error => ({
          ...error,
          autoFixed: fixes.some(fix => fix.line === error.line)
        })),
        fixes,
        warnings
      }
    }
  }
}

function detectSyntaxErrors(code: string, language: string) {
  const errors = []
  
  // Common syntax errors
  if (language === 'javascript' || language === 'typescript') {
    // Missing semicolons
    const lines = code.split('\n')
    lines.forEach((line, index) => {
      if (line.trim() && !line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}') && !line.includes('if') && !line.includes('for') && !line.includes('while')) {
        errors.push({
          type: 'syntax',
          severity: 'low' as const,
          message: 'Missing semicolon',
          line: index + 1,
          column: line.length
        })
      }
    })

    // Unclosed brackets
    const openBrackets = (code.match(/\{/g) || []).length
    const closeBrackets = (code.match(/\}/g) || []).length
    if (openBrackets !== closeBrackets) {
      errors.push({
        type: 'syntax',
        severity: 'high' as const,
        message: `Unclosed brackets: ${openBrackets > closeBrackets ? 'missing }' : 'extra }'}`,
        line: 1
      })
    }

    // Unclosed parentheses
    const openParens = (code.match(/\(/g) || []).length
    const closeParens = (code.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push({
        type: 'syntax',
        severity: 'high' as const,
        message: `Unclosed parentheses: ${openParens > closeParens ? 'missing )' : 'extra )'}`,
        line: 1
      })
    }
  }

  if (language === 'python') {
    // Indentation errors
    const lines = code.split('\n')
    let indentLevel = 0
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('def ') || trimmed.startsWith('class ') || trimmed.startsWith('if ') || trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
        if (index + 1 < lines.length && lines[index + 1].trim() && !lines[index + 1].startsWith('    ')) {
          errors.push({
            type: 'syntax',
            severity: 'high' as const,
            message: 'Missing indentation after block statement',
            line: index + 2
          })
        }
      }
    })
  }

  return errors
}

function detectRuntimeErrors(code: string, language: string) {
  const errors = []
  
  // Common runtime errors
  if (code.includes('undefined') && code.includes('.')) {
    errors.push({
      type: 'runtime',
      severity: 'high' as const,
      message: 'Potential undefined property access',
      line: findLineNumber(code, 'undefined.')
    })
  }

  if (code.includes('null') && code.includes('.')) {
    errors.push({
      type: 'runtime',
      severity: 'high' as const,
      message: 'Potential null reference error',
      line: findLineNumber(code, 'null.')
    })
  }

  if (code.includes('division by zero') || code.match(/\/\s*0/)) {
    errors.push({
      type: 'runtime',
      severity: 'critical' as const,
      message: 'Division by zero detected',
      line: findLineNumber(code, '/0')
    })
  }

  return errors
}

function detectLogicErrors(code: string, language: string) {
  const errors = []
  
  // Common logic errors
  if (code.includes('== ') && !code.includes('===')) {
    errors.push({
      type: 'logic',
      severity: 'medium' as const,
      message: 'Use strict equality (===) to avoid type coercion',
      line: findLineNumber(code, '== ')
    })
  }

  if (code.includes('if (true)') || code.includes('if (false)')) {
    errors.push({
      type: 'logic',
      severity: 'medium' as const,
      message: 'Hardcoded boolean in conditional',
      line: findLineNumber(code, 'if (true)') || findLineNumber(code, 'if (false)')
    })
  }

  // Infinite loops detection
  if (code.includes('while (true)') && !code.includes('break')) {
    errors.push({
      type: 'logic',
      severity: 'high' as const,
      message: 'Potential infinite loop - no break statement found',
      line: findLineNumber(code, 'while (true)')
    })
  }

  return errors
}

function generateFixes(errors: any[], code: string, language: string) {
  const fixes = []
  
  errors.forEach(error => {
    switch (error.type) {
      case 'syntax':
        if (error.message === 'Missing semicolon') {
          fixes.push({
            type: 'add_semicolon',
            description: 'Add missing semicolon',
            line: error.line,
            before: code.split('\n')[error.line - 1],
            after: code.split('\n')[error.line - 1] + ';'
          })
        }
        break

      case 'logic':
        if (error.message.includes('strict equality')) {
          fixes.push({
            type: 'strict_equality',
            description: 'Replace == with ===',
            line: error.line,
            before: code.split('\n')[error.line - 1],
            after: code.split('\n')[error.line - 1].replace('== ', '=== ')
          })
        }
        break
    }
  })

  return fixes
}

function applyFixes(code: string, fixes: any[]): string {
  let fixedCode = code
  
  // Apply fixes in reverse order to maintain line numbers
  fixes.sort((a, b) => (b.line || 0) - (a.line || 0))
  
  fixes.forEach(fix => {
    const lines = fixedCode.split('\n')
    if (fix.line && lines[fix.line - 1]) {
      lines[fix.line - 1] = fix.after
      fixedCode = lines.join('\n')
    }
  })

  return fixedCode
}

function generateWarnings(code: string, language: string) {
  const warnings = []
  
  if (code.includes('console.log') || code.includes('print(')) {
    warnings.push({
      type: 'debug',
      message: 'Debug statements should be removed in production',
      line: findLineNumber(code, 'console.log') || findLineNumber(code, 'print(')
    })
  }

  if (code.includes('TODO') || code.includes('FIXME')) {
    warnings.push({
      type: 'todo',
      message: 'TODO/FIXME comments should be addressed',
      line: findLineNumber(code, 'TODO') || findLineNumber(code, 'FIXME')
    })
  }

  return warnings
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
