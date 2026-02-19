import type { AISecurityRequest, AISecurityResponse } from '~/shared/types/ai'

export function createSecurityScanner() {
  return {
    async scanCode(request: AISecurityRequest): Promise<Omit<AISecurityResponse, 'success'>> {
      const vulnerabilities = []
      const recommendations = []
      
      // Perform different types of security scans
      switch (request.scanType) {
        case 'comprehensive':
          vulnerabilities.push(...await performComprehensiveSecurityScan(request.code, request.language, recommendations))
          break
        case 'owasp':
          vulnerabilities.push(...await performOWASPScan(request.code, request.language, recommendations))
          break
        case 'injection':
          vulnerabilities.push(...await performInjectionScan(request.code, request.language, recommendations))
          break
        case 'xss':
          vulnerabilities.push(...await performXSSScan(request.code, request.language, recommendations))
          break
        case 'crypto':
          vulnerabilities.push(...await performCryptoScan(request.code, request.language, recommendations))
          break
        case 'auth':
          vulnerabilities.push(...await performAuthScan(request.code, request.language, recommendations))
          break
      }

      const riskScore = calculateRiskScore(vulnerabilities)
      const compliance = checkCompliance(vulnerabilities, request.options?.strictMode || false)

      return {
        vulnerabilities,
        riskScore,
        recommendations,
        compliance
      }
    }
  }
}

async function performComprehensiveSecurityScan(code: string, language: string, recommendations: any[]) {
  const vulnerabilities = []
  
  // Run all security scans
  vulnerabilities.push(...await performInjectionScan(code, language, recommendations))
  vulnerabilities.push(...await performXSSScan(code, language, recommendations))
  vulnerabilities.push(...await performCryptoScan(code, language, recommendations))
  vulnerabilities.push(...await performAuthScan(code, language, recommendations))
  vulnerabilities.push(...await performConfigScan(code, language, recommendations))
  
  return vulnerabilities
}

async function performInjectionScan(code: string, language: string, recommendations: any[]) {
  const vulnerabilities = []
  
  // SQL Injection patterns
  const sqlPatterns = [
    {
      pattern: /SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*\+/gi,
      type: 'SQL Injection',
      severity: 'critical',
      cwe: 'CWE-89',
      owasp: 'A03:2021 – Injection',
      title: 'Potential SQL Injection',
      description: 'Direct string concatenation in SQL queries can lead to SQL injection attacks',
      recommendation: 'Use parameterized queries or prepared statements',
      code: 'const query = "SELECT * FROM users WHERE id = ?";\nconst result = db.query(query, [userId]);'
    },
    {
      pattern: /mysql_query\s*\(/gi,
      type: 'SQL Injection',
      severity: 'high',
      cwe: 'CWE-89',
      owasp: 'A03:2021 – Injection',
      title: 'Unsafe MySQL Query',
      description: 'Using mysql_query with user input can lead to SQL injection',
      recommendation: 'Use prepared statements with parameter binding'
    },
    {
      pattern: /\$\{.*\}/gi,
      type: 'Template Injection',
      severity: 'medium',
      cwe: 'CWE-94',
      owasp: 'A03:2021 – Injection',
      title: 'Template Injection Risk',
      description: 'Template literals with user input can lead to injection attacks',
      recommendation: 'Validate and sanitize template inputs'
    }
  ]

  // Command Injection patterns
  const commandPatterns = [
    {
      pattern: /exec\s*\(/gi,
      type: 'Command Injection',
      severity: 'critical',
      cwe: 'CWE-78',
      owasp: 'A03:2021 – Injection',
      title: 'Command Execution',
      description: 'Direct execution of system commands with user input',
      recommendation: 'Avoid exec() with user input, use safe alternatives'
    },
    {
      pattern: /system\s*\(/gi,
      type: 'Command Injection',
      severity: 'critical',
      cwe: 'CWE-78',
      owasp: 'A03:2021 – Injection',
      title: 'System Command Execution',
      description: 'System command execution with potential injection risk',
      recommendation: 'Use safer alternatives like child_process.spawn with sanitized arguments'
    },
    {
      pattern: /shell_exec\s*\(/gi,
      type: 'Command Injection',
      severity: 'critical',
      cwe: 'CWE-78',
      owasp: 'A03:2021 – Injection',
      title: 'Shell Command Execution',
      description: 'Shell command execution vulnerability',
      recommendation: 'Avoid shell_exec with user input'
    }
  ]

  // Check all patterns
  [...sqlPatterns, ...commandPatterns].forEach(({ pattern, type, severity, cwe, owasp, title, description, recommendation, code }) => {
    const matches = code.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        vulnerabilities.push({
          type,
          severity,
          title,
          description,
          line,
          cwe,
          owasp,
          recommendation,
          code
        })
      })
    }
  })

  // Check for eval() usage
  if (code.includes('eval(')) {
    vulnerabilities.push({
      type: 'Code Injection',
      severity: 'critical',
      title: 'Use of eval() Function',
      description: 'eval() can execute arbitrary code and is extremely dangerous',
      line: findLineNumber(code, 'eval('),
      cwe: 'CWE-94',
      owasp: 'A03:2021 – Injection',
      recommendation: 'Never use eval() with user input. Use safer alternatives like JSON.parse()',
      code: 'const data = JSON.parse(userInput);'
    })
  }

  return vulnerabilities
}

async function performXSSScan(code: string, language: string, recommendations: any[]) {
  const vulnerabilities = []
  
  // XSS patterns
  const xssPatterns = [
    {
      pattern: /innerHTML\s*=/gi,
      type: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      cwe: 'CWE-79',
      owasp: 'A03:2021 – Injection',
      title: 'Direct innerHTML Assignment',
      description: 'Setting innerHTML with user input can lead to XSS attacks',
      recommendation: 'Use textContent or sanitize HTML before assignment',
      code: 'element.textContent = userInput; // or use DOMPurify.sanitize(userInput)'
    },
    {
      pattern: /document\.write\s*\(/gi,
      type: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      cwe: 'CWE-79',
      owasp: 'A03:2021 – Injection',
      title: 'Document Write Usage',
      description: 'document.write() can execute malicious scripts',
      recommendation: 'Use DOM manipulation methods instead',
      code: 'element.textContent = content;'
    },
    {
      pattern: /outerHTML\s*=/gi,
      type: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      cwe: 'CWE-79',
      owasp: 'A03:2021 – Injection',
      title: 'OuterHTML Assignment',
      description: 'Setting outerHTML can lead to XSS attacks',
      recommendation: 'Avoid outerHTML with user input'
    },
    {
      pattern: /eval\s*\(/gi,
      type: 'Cross-Site Scripting (XSS)',
      severity: 'critical',
      cwe: 'CWE-79',
      owasp: 'A03:2021 – Injection',
      title: 'Eval with User Input',
      description: 'eval() can execute malicious JavaScript',
      recommendation: 'Never use eval() with user input'
    }
  ]

  xssPatterns.forEach(({ pattern, type, severity, cwe, owasp, title, description, recommendation, code }) => {
    const matches = code.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        vulnerabilities.push({
          type,
          severity,
          title,
          description,
          line,
          cwe,
          owasp,
          recommendation,
          code
        })
      })
    }
  })

  // Check for unsafe URL usage
  if (code.includes('location.href') || code.includes('window.open')) {
    vulnerabilities.push({
      type: 'Cross-Site Scripting (XSS)',
      severity: 'medium',
      title: 'Unsafe URL Assignment',
      description: 'Direct URL assignment with user input can lead to XSS',
      line: findLineNumber(code, 'location.href') || findLineNumber(code, 'window.open'),
      cwe: 'CWE-79',
      owasp: 'A03:2021 – Injection',
      recommendation: 'Validate and encode URLs before assignment',
      code: 'const safeUrl = encodeURI(userInput);\nlocation.href = safeUrl;'
    })
  }

  return vulnerabilities
}

async function performCryptoScan(code: string, language: string, recommendations: any[]) {
  const vulnerabilities = []
  
  // Weak cryptography patterns
  const cryptoPatterns = [
    {
      pattern: /md5\s*\(/gi,
      type: 'Weak Cryptography',
      severity: 'high',
      cwe: 'CWE-327',
      owasp: 'A02:2021 – Cryptographic Failures',
      title: 'MD5 Hash Usage',
      description: 'MD5 is cryptographically broken and should not be used for security purposes',
      recommendation: 'Use SHA-256 or stronger hash functions',
      code: 'const hash = crypto.createHash(\'sha256\').update(data).digest(\'hex\');'
    },
    {
      pattern: /sha1\s*\(/gi,
      type: 'Weak Cryptography',
      severity: 'high',
      cwe: 'CWE-327',
      owasp: 'A02:2021 – Cryptographic Failures',
      title: 'SHA1 Hash Usage',
      description: 'SHA1 is considered weak and should not be used for security purposes',
      recommendation: 'Use SHA-256 or stronger hash functions'
    },
    {
      pattern: /crypto\.createCipher\s*\(/gi,
      type: 'Weak Cryptography',
      severity: 'critical',
      cwe: 'CWE-327',
      owasp: 'A02:2021 – Cryptographic Failures',
      title: 'Deprecated createCipher Usage',
      description: 'createCipher is deprecated and insecure',
      recommendation: 'Use createCipheriv with proper IV generation',
      code: 'const cipher = crypto.createCipheriv(\'aes-256-gcm\', key, iv);'
    }
  ]

  cryptoPatterns.forEach(({ pattern, type, severity, cwe, owasp, title, description, recommendation, code }) => {
    const matches = code.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        vulnerabilities.push({
          type,
          severity,
          title,
          description,
          line,
          cwe,
          owasp,
          recommendation,
          code
        })
      })
    }
  })

  // Check for hardcoded secrets
  const secretPatterns = [
    {
      pattern: /password\s*=\s*["'][^"']+["']/gi,
      type: 'Hardcoded Credentials',
      severity: 'critical',
      cwe: 'CWE-798',
      owasp: 'A07:2021 – Identification and Authentication Failures',
      title: 'Hardcoded Password',
      description: 'Hardcoded passwords in source code are a major security risk',
      recommendation: 'Use environment variables or secure configuration management'
    },
    {
      pattern: /api[_-]?key\s*=\s*["'][^"']+["']/gi,
      type: 'Hardcoded Credentials',
      severity: 'critical',
      cwe: 'CWE-798',
      owasp: 'A07:2021 – Identification and Authentication Failures',
      title: 'Hardcoded API Key',
      description: 'Hardcoded API keys expose sensitive credentials',
      recommendation: 'Store API keys in environment variables'
    },
    {
      pattern: /secret\s*=\s*["'][^"']+["']/gi,
      type: 'Hardcoded Credentials',
      severity: 'critical',
      cwe: 'CWE-798',
      owasp: 'A07:2021 – Identification and Authentication Failures',
      title: 'Hardcoded Secret',
      description: 'Hardcoded secrets compromise application security',
      recommendation: 'Use secure secret management systems'
    }
  ]

  secretPatterns.forEach(({ pattern, type, severity, cwe, owasp, title, description, recommendation }) => {
    const matches = code.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        vulnerabilities.push({
          type,
          severity,
          title,
          description,
          line,
          cwe,
          owasp,
          recommendation,
          code: 'const password = process.env.DB_PASSWORD;'
        })
      })
    }
  })

  return vulnerabilities
}

async function performAuthScan(code: string, language: string, recommendations: any[]) {
  const vulnerabilities = []
  
  // Authentication vulnerabilities
  const authPatterns = [
    {
      pattern: /==\s*["']admin["']/gi,
      type: 'Authentication Bypass',
      severity: 'high',
      cwe: 'CWE-287',
      owasp: 'A07:2021 – Identification and Authentication Failures',
      title: 'Hardcoded Admin Check',
      description: 'Hardcoded admin role check can be bypassed',
      recommendation: 'Implement proper role-based access control'
    },
    {
      pattern: /session\.id\s*=\s*req\.params\.id/gi,
      type: 'Insecure Direct Object Reference',
      severity: 'medium',
      cwe: 'CWE-639',
      owasp: 'A01:2021 – Broken Access Control',
      title: 'Insecure Object Reference',
      description: 'Direct object reference without authorization check',
      recommendation: 'Implement proper authorization checks'
    }
  ]

  authPatterns.forEach(({ pattern, type, severity, cwe, owasp, title, description, recommendation }) => {
    const matches = code.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        vulnerabilities.push({
          type,
          severity,
          title,
          description,
          line,
          cwe,
          owasp,
          recommendation,
          code: 'if (user.hasPermission(\'admin\')) { /* admin actions */ }'
        })
      })
    }
  })

  // Check for missing authentication
  if (code.includes('req.user') && !code.includes('auth')) {
    vulnerabilities.push({
      type: 'Missing Authentication',
      severity: 'high',
      title: 'Potential Missing Authentication',
      description: 'User data accessed without authentication check',
      line: findLineNumber(code, 'req.user'),
      cwe: 'CWE-306',
      owasp: 'A07:2021 – Identification and Authentication Failures',
      recommendation: 'Implement proper authentication middleware'
    })
  }

  return vulnerabilities
}

async function performConfigScan(code: string, language: string, recommendations: any[]) {
  const vulnerabilities = []
  
  // Configuration security issues
  const configPatterns = [
    {
      pattern: /cors\s*\(\s*\{\s*origin:\s*["'][*]["']/gi,
      type: 'Insecure CORS Configuration',
      severity: 'medium',
      cwe: 'CWE-942',
      owasp: 'A05:2021 – Security Misconfiguration',
      title: 'Overly Permissive CORS',
      description: 'CORS configured to allow all origins',
      recommendation: 'Restrict CORS to specific trusted domains',
      code: 'cors({ origin: ["https://trusted-domain.com"] })'
    },
    {
      pattern: /disable\s*:\s*true/gi,
      type: 'Security Feature Disabled',
      severity: 'high',
      cwe: 'CWE-16',
      owasp: 'A05:2021 – Security Misconfiguration',
      title: 'Security Feature Disabled',
      description: 'Security features should not be disabled in production',
      recommendation: 'Enable all security features in production'
    }
  ]

  configPatterns.forEach(({ pattern, type, severity, cwe, owasp, title, description, recommendation, code }) => {
    const matches = code.match(pattern)
    if (matches) {
      matches.forEach(match => {
        const line = findLineNumber(code, match)
        vulnerabilities.push({
          type,
          severity,
          title,
          description,
          line,
          cwe,
          owasp,
          recommendation,
          code
        })
      })
    }
  })

  return vulnerabilities
}

async function performOWASPScan(code: string, language: string, recommendations: any[]) {
  // OWASP Top 10 focused scan
  return await performComprehensiveSecurityScan(code, language, recommendations)
}

function calculateRiskScore(vulnerabilities: any[]) {
  const scores = {
    injection: 100,
    xss: 100,
    crypto: 100,
    auth: 100,
    config: 100
  }

  const severityWeights = {
    info: 1,
    low: 5,
    medium: 15,
    high: 25,
    critical: 40
  }

  vulnerabilities.forEach(vuln => {
    const weight = severityWeights[vuln.severity as keyof typeof severityWeights]
    
    // Categorize vulnerability
    if (vuln.type.includes('Injection') || vuln.type.includes('SQL')) {
      scores.injection = Math.max(0, scores.injection - weight)
    } else if (vuln.type.includes('XSS')) {
      scores.xss = Math.max(0, scores.xss - weight)
    } else if (vuln.type.includes('Crypto') || vuln.type.includes('Hash')) {
      scores.crypto = Math.max(0, scores.crypto - weight)
    } else if (vuln.type.includes('Auth') || vuln.type.includes('Authentication')) {
      scores.auth = Math.max(0, scores.auth - weight)
    } else if (vuln.type.includes('Config') || vuln.type.includes('CORS')) {
      scores.config = Math.max(0, scores.config - weight)
    }
  })

  const overall = Math.round(
    Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
  )

  return {
    overall,
    categories: scores
  }
}

function checkCompliance(vulnerabilities: any[], strictMode: boolean) {
  const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length
  const highVulns = vulnerabilities.filter(v => v.severity === 'high').length
  
  const thresholds = strictMode ? {
    critical: 0,
    high: 0,
    medium: 2
  } : {
    critical: 0,
    high: 2,
    medium: 5
  }

  return {
    owasp: criticalVulns <= thresholds.critical && highVulns <= thresholds.high,
    sans: criticalVulns === 0,
    pci: criticalVulns === 0 && highVulns <= 1,
    gdpr: !vulnerabilities.some(v => v.type.includes('Hardcoded'))
  }
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
