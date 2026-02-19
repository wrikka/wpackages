import type { AIAutocompleteRequest, AIAutocompleteResponse } from '~/shared/types/ai-autocomplete'

export function createAutocompleteEngine() {
  return {
    async generateCompletions(request: AIAutocompleteRequest): Promise<Omit<AIAutocompleteResponse, 'success'>> {
      const context = await analyzeContext(request)
      const completions = await generateCompletions(request, context)
      const suggestions = await generateSuggestions(request, context)

      return {
        completions,
        context,
        suggestions
      }
    }
  }
}

async function analyzeContext(request: AIAutocompleteRequest) {
  const { code, position, language } = request
  const lines = code.split('\n')
  const currentLine = lines[position.line - 1] || ''
  const beforeCursor = currentLine.substring(0, position.column - 1)
  const afterCursor = currentLine.substring(position.column - 1)

  // Extract current word
  const currentWordMatch = beforeCursor.match(/(\w+)$/)
  const currentWord = currentWordMatch ? currentWordMatch[1] : ''

  // Analyze scope
  const scope = determineScope(code, position, language)
  
  // Extract variables in scope
  const variables = extractVariables(code, position, language)
  
  // Extract functions in scope
  const functions = extractFunctions(code, position, language)
  
  // Extract imports
  const imports = extractImports(code, language)

  return {
    scope,
    variables,
    functions,
    imports,
    currentWord,
    beforeCursor,
    afterCursor
  }
}

async function generateCompletions(request: AIAutocompleteRequest, context: any) {
  const completions = []
  const { language, options } = request
  const maxResults = options?.maxResults || 10

  // Language-specific completions
  switch (language) {
    case 'javascript':
    case 'typescript':
      completions.push(...generateJavaScriptCompletions(context, maxResults))
      break
    case 'python':
      completions.push(...generatePythonCompletions(context, maxResults))
      break
    case 'java':
      completions.push(...generateJavaCompletions(context, maxResults))
      break
    case 'go':
      completions.push(...generateGoCompletions(context, maxResults))
      break
    case 'rust':
      completions.push(...generateRustCompletions(context, maxResults))
      break
    case 'php':
      completions.push(...generatePHPCompletions(context, maxResults))
      break
    case 'ruby':
      completions.push(...generateRubyCompletions(context, maxResults))
      break
  }

  // Sort by relevance and limit results
  return completions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxResults)
}

function generateJavaScriptCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'class', 'extends', 'implements', 'import', 'export', 'default', 'async', 'await'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `JavaScript keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  // Built-in objects and methods
  const builtins = [
    'console', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean', 'RegExp', 'JSON', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'
  ]

  builtins.forEach(builtin => {
    if (builtin.toLowerCase().startsWith(context.currentWord.toLowerCase())) {
      completions.push({
        text: builtin,
        type: 'class',
        description: `JavaScript built-in: ${builtin}`,
        priority: 7
      })
    }
  })

  // Console methods
  if (context.scope.includes('console')) {
    const consoleMethods = ['log', 'error', 'warn', 'info', 'debug', 'table', 'time', 'timeEnd', 'group', 'groupEnd', 'clear']
    
    consoleMethods.forEach(method => {
      if (method.startsWith(context.currentWord)) {
        completions.push({
          text: method,
          type: 'method',
          description: `Console method: console.${method}`,
          insertText: `.${method}`,
          priority: 9
        })
      }
    })
  }

  // Array methods
  if (context.scope.includes('Array') || context.scope.includes('[')) {
    const arrayMethods = ['map', 'filter', 'reduce', 'forEach', 'find', 'findIndex', 'some', 'every', 'includes', 'indexOf', 'lastIndexOf', 'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat', 'join', 'reverse', 'sort']
    
    arrayMethods.forEach(method => {
      if (method.startsWith(context.currentWord)) {
        completions.push({
          text: method,
          type: 'method',
          description: `Array method: .${method}()`,
          insertText: `.${method}()`,
          priority: 9
        })
      }
    })
  }

  // Snippets
  const snippets = [
    {
      text: 'for',
      type: 'snippet',
      description: 'for loop',
      insertText: 'for (let i = 0; i < array.length; i++) {\n  \n}',
      priority: 6
    },
    {
      text: 'if',
      type: 'snippet',
      description: 'if statement',
      insertText: 'if (condition) {\n  \n}',
      priority: 6
    },
    {
      text: 'function',
      type: 'snippet',
      description: 'function declaration',
      insertText: 'function name(params) {\n  \n}',
      priority: 6
    },
    {
      text: 'async',
      type: 'snippet',
      description: 'async function',
      insertText: 'async function name(params) {\n  \n}',
      priority: 6
    }
  ]

  completions.push(...snippets)

  return completions
}

function generatePythonCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'pass', 'break', 'continue', 'global', 'nonlocal'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `Python keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  // Built-in functions
  const builtins = [
    'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'reduce', 'sum', 'min', 'max', 'sorted', 'reversed', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool'
  ]

  builtins.forEach(builtin => {
    if (builtin.startsWith(context.currentWord)) {
      completions.push({
        text: builtin,
        type: 'function',
        description: `Python built-in: ${builtin}`,
        priority: 7
      })
    }
  })

  // String methods
  if (context.scope.includes('str') || context.scope.includes("'")) {
    const stringMethods = ['upper', 'lower', 'strip', 'split', 'join', 'replace', 'find', 'index', 'startswith', 'endswith', 'format', 'ljust', 'rjust', 'center']
    
    stringMethods.forEach(method => {
      if (method.startsWith(context.currentWord)) {
        completions.push({
          text: method,
          type: 'method',
          description: `String method: .${method}()`,
          insertText: `.${method}()`,
          priority: 9
        })
      }
    })
  }

  return completions
}

function generateJavaCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'public', 'private', 'protected', 'static', 'final', 'abstract', 'class', 'interface', 'extends', 'implements', 'import', 'package', 'void', 'int', 'String', 'boolean', 'double', 'float', 'long', 'short', 'byte', 'char'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `Java keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  return completions
}

function generateGoCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'func', 'var', 'const', 'type', 'struct', 'interface', 'if', 'else', 'for', 'switch', 'case', 'default', 'break', 'continue', 'return', 'go', 'defer', 'select', 'chan', 'range', 'import', 'package'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `Go keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  return completions
}

function generateRustCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'impl', 'trait', 'mod', 'use', 'pub', 'crate', 'self', 'super', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 'return', 'unsafe', 'async', 'await'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `Rust keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  return completions
}

function generatePHPCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'function', 'class', 'if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'switch', 'case', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'public', 'private', 'protected', 'static', 'abstract', 'final', 'interface', 'implements', 'extends'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `PHP keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  return completions
}

function generateRubyCompletions(context: any, maxResults: number) {
  const completions = []

  // Keywords
  const keywords = [
    'def', 'class', 'module', 'if', 'elsif', 'else', 'unless', 'case', 'when', 'for', 'while', 'do', 'begin', 'end', 'return', 'yield', 'break', 'next', 'redo', 'retry', 'and', 'or', 'not', 'nil', 'true', 'false', 'self'
  ]

  keywords.forEach(keyword => {
    if (keyword.startsWith(context.currentWord)) {
      completions.push({
        text: keyword,
        type: 'keyword',
        description: `Ruby keyword: ${keyword}`,
        priority: 8
      })
    }
  })

  return completions
}

async function generateSuggestions(request: AIAutocompleteRequest, context: any) {
  const suggestions = []

  // Suggest based on context
  if (context.currentWord.length > 2) {
    suggestions.push({
      type: 'completion',
      message: `Found ${context.currentWord} in current scope`,
      code: context.currentWord
    })
  }

  // Suggest imports
  if (context.currentWord.length > 3 && !context.imports.includes(context.currentWord)) {
    suggestions.push({
      type: 'import',
      message: `Consider importing ${context.currentWord}`,
      code: `import ${context.currentWord} from 'package'`
    })
  }

  // Suggest variable naming
  if (context.currentWord.length > 0 && context.beforeCursor.includes('const ')) {
    suggestions.push({
      type: 'naming',
      message: 'Use descriptive variable names',
      code: `const ${context.currentWord} = value`
    })
  }

  return suggestions
}

// Helper functions
function determineScope(code: string, position: any, language: string) {
  const lines = code.split('\n')
  const currentLine = lines[position.line - 1] || ''
  const beforeCursor = currentLine.substring(0, position.column - 1)

  // Simple scope detection
  if (beforeCursor.includes('.')) {
    return 'property'
  } else if (beforeCursor.includes('(')) {
    return 'function'
  } else if (beforeCursor.includes('{')) {
    return 'block'
  } else {
    return 'global'
  }
}

function extractVariables(code: string, position: any, language: string) {
  const variables = []
  const lines = code.split('\n')

  // Extract variable declarations from current and previous lines
  for (let i = 0; i < position.line && i < lines.length; i++) {
    const line = lines[i]
    
    if (language === 'javascript' || language === 'typescript') {
      // const/let/var declarations
      const constMatches = line.match(/(?:const|let|var)\s+(\w+)/g)
      if (constMatches) {
        constMatches.forEach(match => {
          const varName = match.match(/\w+/)?.[0]
          if (varName) variables.push(varName)
        })
      }
    } else if (language === 'python') {
      // Variable assignments
      const varMatches = line.match(/(\w+)\s*=/g)
      if (varMatches) {
        varMatches.forEach(match => {
          const varName = match.match(/\w+/)?.[0]
          if (varName) variables.push(varName)
        })
      }
    }
  }

  return [...new Set(variables)] // Remove duplicates
}

function extractFunctions(code: string, position: any, language: string) {
  const functions = []
  const lines = code.split('\n')

  // Extract function declarations from current and previous lines
  for (let i = 0; i < position.line && i < lines.length; i++) {
    const line = lines[i]
    
    if (language === 'javascript' || language === 'typescript') {
      // function declarations
      const funcMatches = line.match(/function\s+(\w+)/g)
      if (funcMatches) {
        funcMatches.forEach(match => {
          const funcName = match.match(/function\s+(\w+)/)?.[1]
          if (funcName) functions.push(funcName)
        })
      }
    } else if (language === 'python') {
      // def declarations
      const funcMatches = line.match(/def\s+(\w+)/g)
      if (funcMatches) {
        funcMatches.forEach(match => {
          const funcName = match.match(/def\s+(\w+)/)?.[1]
          if (funcName) functions.push(funcName)
        })
      }
    }
  }

  return [...new Set(functions)] // Remove duplicates
}

function extractImports(code: string, language: string) {
  const imports = []
  const lines = code.split('\n')

  lines.forEach(line => {
    if (language === 'javascript' || language === 'typescript') {
      // import statements
      const importMatches = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g)
      if (importMatches) {
        importMatches.forEach(match => {
          const importName = match.match(/from\s+['"]([^'"]+)['"]/)?.[1]
          if (importName) imports.push(importName)
        })
      }
    } else if (language === 'python') {
      // import statements
      const importMatches = line.match(/import\s+(\w+)/g)
      if (importMatches) {
        importMatches.forEach(match => {
          const importName = match.match(/import\s+(\w+)/)?.[1]
          if (importName) imports.push(importName)
        })
      }
    }
  })

  return [...new Set(imports)] // Remove duplicates
}
