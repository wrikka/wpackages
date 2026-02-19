import type { AIPatternRequest, AIPatternResponse } from '~/shared/types/ai'

export function createPatternRecognitionEngine() {
  return {
    async recognizePatterns(request: AIPatternRequest): Promise<Omit<AIPatternResponse, 'success'>> {
      const patterns = await detectCodePatterns(request)
      const suggestions = await generatePatternSuggestions(request, patterns)
      const refactorings = await generateRefactorings(request, patterns)
      const metrics = await calculatePatternMetrics(patterns)

      return {
        patterns,
        suggestions,
        refactorings,
        metrics
      }
    }
  }
}

async function detectCodePatterns(request: AIPatternRequest) {
  const patterns = []
  const { code, language, patternType } = request

  if (patternType === 'all' || patternType === 'design') {
    patterns.push(...await detectDesignPatterns(code, language))
  }

  if (patternType === 'all' || patternType === 'anti-patterns') {
    patterns.push(...await detectAntiPatterns(code, language))
  }

  if (patternType === 'all' || patternType === 'performance') {
    patterns.push(...await detectPerformancePatterns(code, language))
  }

  if (patternType === 'all' || patternType === 'security') {
    patterns.push(...await detectSecurityPatterns(code, language))
  }

  if (patternType === 'all' || patternType === 'architectural') {
    patterns.push(...await detectArchitecturalPatterns(code, language))
  }

  return patterns
}

async function detectDesignPatterns(code: string, language: string) {
  const patterns = []

  // Singleton Pattern
  const singletonMatches = code.match(/getInstance|static.*instance|private.*constructor/gi) || []
  if (singletonMatches.length > 0) {
    patterns.push({
      name: 'Singleton',
      type: 'design',
      description: 'Ensures a class has only one instance and provides global access to it',
      confidence: 0.85,
      location: findPatternLocation(code, singletonMatches[0]),
      code: extractPatternCode(code, singletonMatches[0]),
      examples: [
        'class Database {\n  private static instance: Database;\n  public static getInstance() { ... }\n}'
      ]
    })
  }

  // Factory Pattern
  const factoryMatches = code.match(/create.*return.*new|Factory|createInstance/gi) || []
  if (factoryMatches.length > 0) {
    patterns.push({
      name: 'Factory',
      type: 'design',
      description: 'Creates objects without specifying the exact class',
      confidence: 0.75,
      location: findPatternLocation(code, factoryMatches[0]),
      code: extractPatternCode(code, factoryMatches[0]),
      examples: [
        'class VehicleFactory {\n  static create(type: string) { return new type(); }\n}'
      ]
    })
  }

  // Observer Pattern
  const observerMatches = code.match(/addEventListener|subscribe|notify|observer/gi) || []
  if (observerMatches.length > 0) {
    patterns.push({
      name: 'Observer',
      type: 'design',
      description: 'Defines a one-to-many dependency between objects',
      confidence: 0.8,
      location: findPatternLocation(code, observerMatches[0]),
      code: extractPatternCode(code, observerMatches[0]),
      examples: [
        'class Subject {\n  private observers: Observer[] = [];\n  subscribe(observer) { ... }\n  notify() { ... }\n}'
      ]
    })
  }

  // Strategy Pattern
  const strategyMatches = code.match(/interface.*Strategy|Strategy.*interface|Strategy.*class/gi) || []
  if (strategyMatches.length > 0) {
    patterns.push({
      name: 'Strategy',
      type: 'design',
      description: 'Defines a family of algorithms and makes them interchangeable',
      confidence: 0.7,
      location: findPatternLocation(code, strategyMatches[0]),
      code: extractPatternCode(code, strategyMatches[0]),
      examples: [
        'interface PaymentStrategy { pay(amount: number): void; }\nclass CreditCardStrategy implements PaymentStrategy { ... }'
      ]
    })
  }

  // Repository Pattern
  const repositoryMatches = code.match(/Repository|save|findById|findAll/gi) || []
  if (repositoryMatches.length > 0) {
    patterns.push({
      name: 'Repository',
      type: 'design',
      description: 'Mediates between the domain and data mapping layers',
      confidence: 0.75,
      location: findPatternLocation(code, repositoryMatches[0]),
      code: extractPatternCode(code, repositoryMatches[0]),
      examples: [
        'class UserRepository {\n  save(user: User) { ... }\n  findById(id: number) { ... }\n}'
      ]
    })
  }

  return patterns
}

async function detectAntiPatterns(code: string, language: string) {
  const patterns = []

  // Magic Numbers
  const magicNumberMatches = code.match(/\b\d{2,}\b/g) || []
  if (magicNumberMatches.length > 0) {
    patterns.push({
      name: 'Magic Numbers',
      type: 'anti-pattern',
      description: 'Using unnamed numeric constants that should be named',
      confidence: 0.9,
      location: findPatternLocation(code, magicNumberMatches[0]),
      code: extractPatternCode(code, magicNumberMatches[0]),
      examples: [
        '// Bad: const timeout = 5000;\n// Good: const TIMEOUT_MS = 5000;'
      ]
    })
  }

  // Long Methods
  const longMethodMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{200,}/gi) || []
  if (longMethodMatches.length > 0) {
    patterns.push({
      name: 'Long Method',
      type: 'anti-pattern',
      description: 'Methods that are too long and do too much',
      confidence: 0.8,
      location: findPatternLocation(code, longMethodMatches[0]),
      code: extractPatternCode(code, longMethodMatches[0]),
      examples: [
        '// Bad: function processEverything() { /* 50+ lines */ }\n// Good: function processEverything() { validate(); calculate(); save(); }'
      ]
    })
  }

  // God Class
  const godClassMatches = code.match(/class\s+\w+\s*\{[\s\S]{500,}/gi) || []
  if (godClassMatches.length > 0) {
    patterns.push({
      name: 'God Class',
      type: 'anti-pattern',
      description: 'A class that knows too much or does too much',
      confidence: 0.85,
      location: findPatternLocation(code, godClassMatches[0]),
      code: extractPatternCode(code, godClassMatches[0]),
      examples: [
        '// Bad: class EverythingManager { /* handles everything */ }\n// Good: class UserManager { /* handles users only */ }'
      ]
    })
  }

  // Deep Nesting
  const deepNestingMatches = code.match(/(\s{4,}if|\s{6,}for|\s{8,}while)/gi) || []
  if (deepNestingMatches.length > 0) {
    patterns.push({
      name: 'Deep Nesting',
      type: 'anti-pattern',
      description: 'Code with too many levels of nesting',
      confidence: 0.75,
      location: findPatternLocation(code, deepNestingMatches[0]),
      code: extractPatternCode(code, deepNestingMatches[0]),
      examples: [
        '// Bad: if (a) { if (b) { if (c) { if (d) { ... } } } }\n// Good: if (a && b && c && d) { ... }'
      ]
    })
  }

  // Copy-Paste Programming
  const duplicateLines = findDuplicateLines(code)
  if (duplicateLines.length > 0) {
    patterns.push({
      name: 'Copy-Paste Programming',
      type: 'anti-pattern',
      description: 'Duplicated code that should be extracted into a function',
      confidence: 0.9,
      location: findPatternLocation(code, duplicateLines[0]),
      code: extractPatternCode(code, duplicateLines[0]),
      examples: [
        '// Bad: Same validation logic repeated in multiple places\n// Good: Extract validation into a reusable function'
      ]
    })
  }

  return patterns
}

async function detectPerformancePatterns(code: string, language: string) {
  const patterns = []

  // Caching Pattern
  const cacheMatches = code.match(/cache|memo|Map.*cache/gi) || []
  if (cacheMatches.length > 0) {
    patterns.push({
      name: 'Caching',
      type: 'performance',
      description: 'Storing expensive function results to avoid recomputation',
      confidence: 0.8,
      location: findPatternLocation(code, cacheMatches[0]),
      code: extractPatternCode(code, cacheMatches[0]),
      examples: [
        'const cache = new Map();\nfunction expensive(x) {\n  if (cache.has(x)) return cache.get(x);\n  const result = compute(x);\n  cache.set(x, result);\n  return result;\n}'
      ]
    })
  }

  // Lazy Loading Pattern
  const lazyMatches = code.match(/lazy|defer|import\(/gi) || []
  if (lazyMatches.length > 0) {
    patterns.push({
      name: 'Lazy Loading',
      type: 'performance',
      description: 'Loading resources only when they are needed',
      confidence: 0.75,
      location: findPatternLocation(code, lazyMatches[0]),
      code: extractPatternCode(code, lazyMatches[0]),
      examples: [
        'const loadModule = () => import("./heavyModule");\n// Module is only loaded when loadModule() is called'
      ]
    })
  }

  // Object Pooling
  const poolMatches = code.match(/pool|Pool|recycle/gi) || []
  if (poolMatches.length > 0) {
    patterns.push({
      name: 'Object Pooling',
      type: 'performance',
      description: 'Reusing objects instead of creating new ones',
      confidence: 0.7,
      location: findPatternLocation(code, poolMatches[0]),
      code: extractPatternCode(code, poolMatches[0]),
      examples: [
        'class ObjectPool {\n  private pool: T[] = [];\n  acquire(): T { ... }\n  release(obj: T) { ... }\n}'
      ]
    })
  }

  // Batch Processing
  const batchMatches = code.match(/batch|bulk|chunk/gi) || []
  if (batchMatches.length > 0) {
    patterns.push({
      name: 'Batch Processing',
      type: 'performance',
      description: 'Processing multiple items together for efficiency',
      confidence: 0.8,
      location: findPatternLocation(code, batchMatches[0]),
      code: extractPatternCode(code, batchMatches[0]),
      examples: [
        'async function processBatch(items: T[]) {\n  const batches = chunk(items, 100);\n  for (const batch of batches) { await process(batch); }\n}'
      ]
    })
  }

  return patterns
}

async function detectSecurityPatterns(code: string, language: string) {
  const patterns = []

  // Input Validation Pattern
  const validationMatches = code.match(/validate|sanitize|clean/gi) || []
  if (validationMatches.length > 0) {
    patterns.push({
      name: 'Input Validation',
      type: 'security',
      description: 'Validating user input before processing',
      confidence: 0.85,
      location: findPatternLocation(code, validationMatches[0]),
      code: extractPatternCode(code, validationMatches[0]),
      examples: [
        'function validateInput(input: string): string {\n  if (!input || input.length > 100) throw new Error("Invalid input");\n  return input.trim();\n}'
      ]
    })
  }

  // Authentication Pattern
  const authMatches = code.match(/auth|login|jwt|bcrypt/gi) || []
  if (authMatches.length > 0) {
    patterns.push({
      name: 'Authentication',
      type: 'security',
      description: 'Implementing secure authentication mechanisms',
      confidence: 0.8,
      location: findPatternLocation(code, authMatches[0]),
      code: extractPatternCode(code, authMatches[0]),
      examples: [
        'async function authenticate(token: string) {\n  const payload = jwt.verify(token, SECRET);\n  return payload;\n}'
      ]
    })
  }

  // Authorization Pattern
  const authorizationMatches = code.match(/authorize|permission|role/gi) || []
  if (authorizationMatches.length > 0) {
    patterns.push({
      name: 'Authorization',
      type: 'security',
      description: 'Checking user permissions before allowing actions',
      confidence: 0.75,
      location: findPatternLocation(code, authorizationMatches[0]),
      code: extractPatternCode(code, authorizationMatches[0]),
      examples: [
        'function checkPermission(user: User, resource: string, action: string): boolean {\n  return user.permissions.includes(`${resource}:${action}`);\n}'
      ]
    })
  }

  // Secure Storage Pattern
  const secureStorageMatches = code.match(/encrypt|hash|secure/gi) || []
  if (secureStorageMatches.length > 0) {
    patterns.push({
      name: 'Secure Storage',
      type: 'security',
      description: 'Encrypting sensitive data before storage',
      confidence: 0.8,
      location: findPatternLocation(code, secureStorageMatches[0]),
      code: extractPatternCode(code, secureStorageMatches[0]),
      examples: [
        'async function storeSecure(data: string) {\n  const encrypted = await encrypt(data, KEY);\n  return await db.store(encrypted);\n}'
      ]
    })
  }

  return patterns
}

async function detectArchitecturalPatterns(code: string, language: string) {
  const patterns = []

  // MVC Pattern
  const mvcMatches = code.match(/Model|View|Controller/gi) || []
  if (mvcMatches.length >= 2) {
    patterns.push({
      name: 'Model-View-Controller',
      type: 'architectural',
      description: 'Separating application logic into three interconnected components',
      confidence: 0.8,
      location: findPatternLocation(code, mvcMatches[0]),
      code: extractPatternCode(code, mvcMatches[0]),
      examples: [
        '// Model: class User { ... }\n// View: class UserView { ... }\n// Controller: class UserController { ... }'
      ]
    })
  }

  // Microservices Pattern
  const microserviceMatches = code.match(/service|api|endpoint/gi) || []
  if (microserviceMatches.length > 0) {
    patterns.push({
      name: 'Microservices',
      type: 'architectural',
      description: 'Building applications as a collection of loosely coupled services',
      confidence: 0.7,
      location: findPatternLocation(code, microserviceMatches[0]),
      code: extractPatternCode(code, microserviceMatches[0]),
      examples: [
        '@Controller("/api/users")\nexport class UserService {\n  @Get() getUsers() { ... }\n  @Post() createUser() { ... }\n}'
      ]
    })
  }

  // Event-Driven Architecture
  const eventMatches = code.match(/Event|emit|on|subscribe/gi) || []
  if (eventMatches.length > 2) {
    patterns.push({
      name: 'Event-Driven Architecture',
      type: 'architectural',
      description: 'Building systems around events and event handlers',
      confidence: 0.75,
      location: findPatternLocation(code, eventMatches[0]),
      code: extractPatternCode(code, eventMatches[0]),
      examples: [
        'class EventBus {\n  emit(event: string, data: any) { ... }\n  on(event: string, handler: Function) { ... }\n}'
      ]
    })
  }

  // Layered Architecture
  const layerMatches = code.match(/layer|repository|service|controller/gi) || []
  if (layerMatches.length >= 3) {
    patterns.push({
      name: 'Layered Architecture',
      type: 'architectural',
      description: 'Organizing code into distinct layers with specific responsibilities',
      confidence: 0.8,
      location: findPatternLocation(code, layerMatches[0]),
      code: extractPatternCode(code, layerMatches[0]),
      examples: [
        '// Presentation Layer: Controllers\n// Business Layer: Services\n// Data Layer: Repositories'
      ]
    })
  }

  return patterns
}

async function generatePatternSuggestions(request: AIPatternRequest, patterns: any[]) {
  const suggestions = []

  patterns.forEach(pattern => {
    if (pattern.type === 'anti-pattern') {
      suggestions.push({
        pattern: pattern.name,
        suggestion: getAntiPatternSuggestion(pattern.name),
        code: getRefactoringCode(pattern.name),
        benefit: getRefactoringBenefit(pattern.name)
      })
    }
  })

  return suggestions
}

async function generateRefactorings(request: AIPatternRequest, patterns: any[]) {
  const refactorings = []

  patterns.forEach(pattern => {
    if (pattern.type === 'anti-pattern') {
      refactorings.push({
        from: pattern.name,
        to: getRefactoredPattern(pattern.name),
        pattern: pattern.name,
        description: getRefactoringDescription(pattern.name),
        steps: getRefactoringSteps(pattern.name)
      })
    }
  })

  return refactorings
}

async function calculatePatternMetrics(patterns: any[]) {
  const patternCount = patterns.filter(p => p.type === 'design').length
  const antiPatternCount = patterns.filter(p => p.type === 'anti-pattern').length
  const qualityScore = Math.max(0, 100 - (antiPatternCount * 10))
  const complexity = calculateCodeComplexity(patterns)

  return {
    patternCount,
    antiPatternCount,
    qualityScore,
    complexity
  }
}

// Helper functions
function findPatternLocation(code: string, match: string) {
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

function extractPatternCode(code: string, match: string) {
  const lines = code.split('\n')
  const matchLineIndex = lines.findIndex(line => line.includes(match))
  
  if (matchLineIndex !== -1) {
    const start = Math.max(0, matchLineIndex - 2)
    const end = Math.min(lines.length, matchLineIndex + 3)
    return lines.slice(start, end).join('\n')
  }
  
  return match
}

function findDuplicateLines(code: string) {
  const lines = code.split('\n')
  const lineCounts = new Map()
  const duplicates = []

  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed.length > 10) {
      lineCounts.set(trimmed, (lineCounts.get(trimmed) || 0) + 1)
    }
  })

  lineCounts.forEach((count, line) => {
    if (count > 1) {
      duplicates.push(line)
    }
  })

  return duplicates
}

function getAntiPatternSuggestion(antiPattern: string) {
  const suggestions = {
    'Magic Numbers': 'Replace magic numbers with named constants',
    'Long Method': 'Break down long methods into smaller, focused functions',
    'God Class': 'Split the class into smaller classes with single responsibilities',
    'Deep Nesting': 'Reduce nesting using early returns or extract methods',
    'Copy-Paste Programming': 'Extract duplicated code into reusable functions'
  }
  
  return suggestions[antiPattern as keyof typeof suggestions] || 'Refactor to improve code quality'
}

function getRefactoringCode(antiPattern: string) {
  const refactorings = {
    'Magic Numbers': 'const MAX_RETRIES = 3; const TIMEOUT_MS = 5000;',
    'Long Method': 'function process() { validate(); calculate(); save(); }',
    'God Class': 'class UserManager { /* user management */ } class AuthManager { /* auth */ }',
    'Deep Nesting': 'if (!isValid()) return; if (!hasPermission()) return;',
    'Copy-Paste Programming': 'function validateInput(input) { /* validation logic */ }'
  }
  
  return refactorings[antiPattern as keyof typeof refactorings] || '// Refactored code'
}

function getRefactoringBenefit(antiPattern: string) {
  const benefits = {
    'Magic Numbers': 'Improved readability and maintainability',
    'Long Method': 'Better testability and single responsibility',
    'God Class': 'Improved separation of concerns and maintainability',
    'Deep Nesting': 'Improved readability and reduced complexity',
    'Copy-Paste Programming': 'Reduced code duplication and easier maintenance'
  }
  
  return benefits[antiPattern as keyof typeof benefits] || 'Improved code quality'
}

function getRefactoredPattern(antiPattern: string) {
  const refactored = {
    'Magic Numbers': 'Named Constants',
    'Long Method': 'Extract Method',
    'God Class': 'Single Responsibility Principle',
    'Deep Nesting': 'Early Return Pattern',
    'Copy-Paste Programming': 'DRY Principle'
  }
  
  return refactored[antiPattern as keyof typeof refactored] || 'Clean Code'
}

function getRefactoringDescription(antiPattern: string) {
  const descriptions = {
    'Magic Numbers': 'Extract magic numbers into well-named constants',
    'Long Method': 'Break down long method into smaller, focused methods',
    'God Class': 'Split god class into smaller classes with single responsibilities',
    'Deep Nesting': 'Reduce nesting using early returns and guard clauses',
    'Copy-Paste Programming': 'Extract duplicated code into reusable functions'
  }
  
  return descriptions[antiPattern as keyof typeof descriptions] || 'Refactor to improve code quality'
}

function getRefactoringSteps(antiPattern: string) {
  const steps = {
    'Magic Numbers': [
      'Identify all magic numbers in the code',
      'Create named constants for each magic number',
      'Replace magic numbers with constant references'
    ],
    'Long Method': [
      'Identify distinct responsibilities in the long method',
      'Extract each responsibility into a separate method',
      'Update the original method to call the new methods'
    ],
    'God Class': [
      'Identify different responsibilities in the god class',
      'Create separate classes for each responsibility',
      'Move relevant methods and properties to appropriate classes'
    ],
    'Deep Nesting': [
      'Identify nested conditions that can be simplified',
      'Use early returns to reduce nesting levels',
      'Extract complex conditions into well-named methods'
    ],
    'Copy-Paste Programming': [
      'Identify duplicated code blocks',
      'Extract common logic into a reusable function',
      'Replace all occurrences with calls to the new function'
    ]
  }
  
  return steps[antiPattern as keyof typeof steps] || ['Analyze the anti-pattern', 'Plan the refactoring', 'Implement the solution']
}

function calculateCodeComplexity(patterns: any[]) {
  const antiPatternWeights = {
    'Magic Numbers': 2,
    'Long Method': 5,
    'God Class': 8,
    'Deep Nesting': 4,
    'Copy-Paste Programming': 6
  }

  let complexity = 1

  patterns.forEach(pattern => {
    if (pattern.type === 'anti-pattern') {
      complexity += antiPatternWeights[pattern.name as keyof typeof antiPatternWeights] || 1
    }
  })

  return Math.min(10, complexity)
}
