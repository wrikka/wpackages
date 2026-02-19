import type { AIDocumentationRequest, AIDocumentationResponse } from '~/shared/types/ai'

export function createDocumentationEngine() {
  return {
    async generateDocumentation(request: AIDocumentationRequest): Promise<Omit<AIDocumentationResponse, 'success'>> {
      const functions = extractFunctions(request.code, request.language)
      const metadata = generateMetadata(functions, request.language)
      const examples = request.options?.includeExamples ? generateExamples(functions, request.language) : []
      
      let documentation = ''
      
      switch (request.docType) {
        case 'api':
          documentation = generateAPIDocumentation(functions, request.format, request.options)
          break
        case 'readme':
          documentation = generateReadmeDocumentation(metadata, functions, request.format)
          break
        case 'inline':
          documentation = generateInlineDocumentation(functions, request.language, request.format)
          break
        case 'javadoc':
          documentation = generateJSDocDocumentation(functions, request.format)
          break
        case 'jsdoc':
          documentation = generateJSDocDocumentation(functions, request.format)
          break
      }

      return {
        documentation,
        metadata,
        examples
      }
    }
  }
}

function extractFunctions(code: string, language: string) {
  const functions = []
  const lines = code.split('\n')
  
  lines.forEach((line, index) => {
    let funcMatch = null
    
    switch (language) {
      case 'javascript':
      case 'typescript':
        funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\([^)]*\)\s*\{))/)
        break
      case 'python':
        funcMatch = line.match(/def\s+(\w+)\s*\(([^)]*)\)/)
        break
      case 'java':
        funcMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(([^)]*)\)/)
        break
      case 'go':
        funcMatch = line.match(/func\s+(\w+)\s*\(([^)]*)\)/)
        break
    }

    if (funcMatch) {
      const funcName = funcMatch[1] || funcMatch[2]
      const params = extractParameters(funcMatch[0] || '', language)
      const returnType = extractReturnType(line, language)
      const description = extractFunctionDescription(code, index, funcName)
      
      functions.push({
        name: funcName,
        description,
        parameters: params,
        returns: returnType,
        examples: []
      })
    }
  })

  return functions
}

function extractParameters(paramString: string, language: string) {
  if (!paramString) return []
  
  const params = paramString.split(',').map(p => p.trim())
  return params.map(param => {
    let name = param
    let type = 'any'
    let optional = false
    
    switch (language) {
      case 'typescript':
        const tsMatch = param.match(/(\w+)\s*(\?)?:\s*(\w+)/)
        if (tsMatch) {
          name = tsMatch[1]
          optional = !!tsMatch[2]
          type = tsMatch[3]
        }
        break
      case 'java':
        const javaMatch = param.match(/(\w+)\s+(\w+)/)
        if (javaMatch) {
          type = javaMatch[1]
          name = javaMatch[2]
        }
        break
      case 'python':
        const pyMatch = param.match(/(\w+)(?:\s*=\s*(.+))?/)
        if (pyMatch) {
          name = pyMatch[1]
          type = pyMatch[2] || 'any'
        }
        break
    }
    
    return {
      name,
      type,
      description: `Parameter ${name}`,
      optional
    }
  })
}

function extractReturnType(line: string, language: string) {
  switch (language) {
    case 'typescript':
      const tsMatch = line.match(/:\s*(\w+(?:<[^>]+>)?)\s*(?:=>|\{)/)
      if (tsMatch) {
        return {
          type: tsMatch[1],
          description: `Returns ${tsMatch[1]}`
        }
      }
      break
    case 'java':
      const javaMatch = line.match(/\)\s*:\s*(\w+(?:<[^>]+>)?)/)
      if (javaMatch) {
        return {
          type: javaMatch[1],
          description: `Returns ${javaMatch[1]}`
        }
      }
      break
  }
  
  return {
    type: 'void',
    description: 'No return value'
  }
}

function extractFunctionDescription(code: string, lineIndex: number, funcName: string) {
  const lines = code.split('\n')
  
  // Look for comments above the function
  for (let i = lineIndex - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line.startsWith('//') || line.startsWith('#') || line.startsWith('*')) {
      return line.replace(/^[/#*]\s*/, '').trim()
    }
    if (line && !line.startsWith('//') && !line.startsWith('#') && !line.startsWith('*')) {
      break
    }
  }
  
  return `Function ${funcName} - Auto-generated description`
}

function generateMetadata(functions: any[], language: string) {
  return {
    title: 'API Documentation',
    description: `Auto-generated documentation for ${language} functions`,
    version: '1.0.0',
    functions
  }
}

function generateAPIDocumentation(functions: any[], format: string, options?: any) {
  if (format === 'html') {
    return generateHTMLDocumentation(functions)
  } else if (format === 'json') {
    return JSON.stringify(functions, null, 2)
  }
  
  // Default to markdown
  return generateMarkdownDocumentation(functions, options)
}

function generateMarkdownDocumentation(functions: any[], options?: any) {
  let docs = '# API Documentation\n\n'
  
  functions.forEach(func => {
    docs += `## ${func.name}\n\n`
    docs += `${func.description}\n\n`
    
    if (func.parameters.length > 0) {
      docs += '### Parameters\n\n'
      func.parameters.forEach(param => {
        const optional = param.optional ? ' (optional)' : ''
        docs += `- **${param.name}**${optional}: ${param.type} - ${param.description}\n`
      })
      docs += '\n'
    }
    
    docs += `### Returns\n\n`
    docs += `${func.returns.type} - ${func.returns.description}\n\n`
    
    if (options?.includeExamples) {
      docs += '### Example\n\n'
      docs += '```' + getLanguageForCodeBlock() + '\n'
      docs += generateExampleCode(func)
      docs += '\n```\n\n'
    }
  })
  
  return docs
}

function generateHTMLDocumentation(functions: any[]) {
  let html = '<!DOCTYPE html><html><head><title>API Documentation</title>'
  html += '<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;}'
  html += 'h1{color:#333;border-bottom:2px solid #eee;padding-bottom:10px;}'
  html += 'h2{color:#555;margin-top:30px;}'
  html += 'h3{color:#666;}'
  html += 'pre{background:#f5f5f5;padding:15px;border-radius:5px;overflow-x:auto;}'
  html += 'code{background:#f0f0f0;padding:2px 4px;border-radius:3px;}'
  html += '</style></head><body>'
  
  html += '<h1>API Documentation</h1>'
  
  functions.forEach(func => {
    html += `<h2>${func.name}</h2>`
    html += `<p>${func.description}</p>`
    
    if (func.parameters.length > 0) {
      html += '<h3>Parameters</h3><ul>'
      func.parameters.forEach(param => {
        const optional = param.optional ? ' (optional)' : ''
        html += `<li><strong>${param.name}</strong>${optional}: ${param.type} - ${param.description}</li>`
      })
      html += '</ul>'
    }
    
    html += '<h3>Returns</h3>'
    html += `<p><code>${func.returns.type}</code> - ${func.returns.description}</p>`
  })
  
  html += '</body></html>'
  return html
}

function generateInlineDocumentation(functions: any[], language: string, format: string) {
  let docs = ''
  
  functions.forEach(func => {
    switch (language) {
      case 'javascript':
      case 'typescript':
        docs += `/**\n`
        docs += ` * ${func.description}\n`
        func.parameters.forEach(param => {
          const optional = param.optional ? ' - optional' : ''
          docs += ` * @param {${param.type}} ${param.name}${optional} ${param.description}\n`
        })
        docs += ` * @returns {${func.returns.type}} ${func.returns.description}\n`
        docs += ` */\n`
        break
        
      case 'python':
        docs += `"""\n`
        docs += `${func.description}\n`
        func.parameters.forEach(param => {
          docs += `@param ${param.name}: ${param.type} - ${param.description}\n`
        })
        docs += `@returns: ${func.returns.type} - ${func.returns.description}\n`
        docs += `"""\n`
        break
        
      case 'java':
        docs += `/**\n`
        docs += ` * ${func.description}\n`
        func.parameters.forEach(param => {
          docs += ` * @param ${param.name} ${param.description}\n`
        })
        docs += ` * @return ${func.returns.description}\n`
        docs += ` */\n`
        break
    }
  })
  
  return docs
}

function generateJSDocDocumentation(functions: any[], format: string) {
  return generateInlineDocumentation(functions, 'javascript', format)
}

function generateExamples(functions: any[], language: string) {
  return functions.map(func => ({
    title: `${func.name} Example`,
    code: generateExampleCode(func),
    description: `Example usage of ${func.name} function`
  }))
}

function generateExampleCode(func: any) {
  const params = func.parameters.map(p => p.name).join(', ')
  return `const result = ${func.name}(${params})`
}

function generateReadmeDocumentation(metadata: any, functions: any[], format: string) {
  let readme = `# ${metadata.title}\n\n`
  readme += `${metadata.description}\n\n`
  readme += `## Functions\n\n`
  
  functions.forEach(func => {
    readme += `### ${func.name}\n`
    readme += `${func.description}\n\n`
  })
  
  readme += `## Installation\n\n`
  readme += `\`\`\`bash\nnpm install\n\`\`\`\n\n`
  readme += `## Usage\n\n`
  readme += `\`\`\`javascript\nimport { ${functions.map(f => f.name).join(', ')} } from './module'\`\`\`\n\n`
  
  return readme
}

function getLanguageForCodeBlock() {
  // Could be enhanced to detect from context
  return 'javascript'
}
