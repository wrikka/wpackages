export function createLanguageSupportEngine() {
  return {
    async getSupportedLanguages() {
      return [
        {
          name: 'JavaScript',
          id: 'javascript',
          extensions: ['.js', '.jsx', '.mjs'],
          mimeType: 'text/javascript',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 95,
          difficulty: 'beginner'
        },
        {
          name: 'TypeScript',
          id: 'typescript',
          extensions: ['.ts', '.tsx'],
          mimeType: 'text/typescript',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging', 'type-checking'],
          popularity: 85,
          difficulty: 'intermediate'
        },
        {
          name: 'Python',
          id: 'python',
          extensions: ['.py', '.pyw'],
          mimeType: 'text/x-python',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 90,
          difficulty: 'beginner'
        },
        {
          name: 'Java',
          id: 'java',
          extensions: ['.java'],
          mimeType: 'text/x-java-source',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 75,
          difficulty: 'intermediate'
        },
        {
          name: 'Go',
          id: 'go',
          extensions: ['.go'],
          mimeType: 'text/x-go',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 60,
          difficulty: 'intermediate'
        },
        {
          name: 'C++',
          id: 'cpp',
          extensions: ['.cpp', '.cxx', '.cc', '.h', '.hpp'],
          mimeType: 'text/x-c++src',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 70,
          difficulty: 'advanced'
        },
        {
          name: 'Rust',
          id: 'rust',
          extensions: ['.rs'],
          mimeType: 'text/x-rustsrc',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 45,
          difficulty: 'advanced'
        },
        {
          name: 'PHP',
          id: 'php',
          extensions: ['.php', '.phtml'],
          mimeType: 'text/x-php',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 65,
          difficulty: 'beginner'
        },
        {
          name: 'Ruby',
          id: 'ruby',
          extensions: ['.rb', '.rbw'],
          mimeType: 'text/x-ruby',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 40,
          difficulty: 'beginner'
        },
        {
          name: 'Swift',
          id: 'swift',
          extensions: ['.swift'],
          mimeType: 'text/x-swift',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 35,
          difficulty: 'intermediate'
        },
        {
          name: 'Kotlin',
          id: 'kotlin',
          extensions: ['.kt', '.kts'],
          mimeType: 'text/x-kotlin',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 30,
          difficulty: 'intermediate'
        },
        {
          name: 'C#',
          id: 'csharp',
          extensions: ['.cs'],
          mimeType: 'text/x-csharp',
          features: ['syntax', 'completion', 'linting', 'formatting', 'debugging'],
          popularity: 70,
          difficulty: 'intermediate'
        },
        {
          name: 'HTML',
          id: 'html',
          extensions: ['.html', '.htm'],
          mimeType: 'text/html',
          features: ['syntax', 'completion', 'linting', 'formatting'],
          popularity: 95,
          difficulty: 'beginner'
        },
        {
          name: 'CSS',
          id: 'css',
          extensions: ['.css', '.scss', '.sass'],
          mimeType: 'text/css',
          features: ['syntax', 'completion', 'linting', 'formatting'],
          popularity: 90,
          difficulty: 'beginner'
        },
        {
          name: 'SQL',
          id: 'sql',
          extensions: ['.sql'],
          mimeType: 'text/x-sql',
          features: ['syntax', 'completion', 'linting', 'formatting'],
          popularity: 80,
          difficulty: 'intermediate'
        },
        {
          name: 'JSON',
          id: 'json',
          extensions: ['.json'],
          mimeType: 'application/json',
          features: ['syntax', 'completion', 'linting', 'formatting'],
          popularity: 85,
          difficulty: 'beginner'
        },
        {
          name: 'YAML',
          id: 'yaml',
          extensions: ['.yaml', '.yml'],
          mimeType: 'text/x-yaml',
          features: ['syntax', 'completion', 'linting', 'formatting'],
          popularity: 70,
          difficulty: 'beginner'
        },
        {
          name: 'Markdown',
          id: 'markdown',
          extensions: ['.md', '.markdown'],
          mimeType: 'text/markdown',
          features: ['syntax', 'completion', 'linting', 'formatting', 'preview'],
          popularity: 75,
          difficulty: 'beginner'
        }
      ]
    },

    getSupportedFeatures() {
      return [
        {
          id: 'syntax',
          name: 'Syntax Highlighting',
          description: 'Color-coded syntax highlighting for better readability'
        },
        {
          id: 'completion',
          name: 'Auto-completion',
          description: 'Intelligent code completion and suggestions'
        },
        {
          id: 'linting',
          name: 'Linting',
          description: 'Real-time error detection and code quality checks'
        },
        {
          id: 'formatting',
          name: 'Code Formatting',
          description: 'Automatic code formatting and style enforcement'
        },
        {
          id: 'debugging',
          name: 'Debugging',
          description: 'Integrated debugging tools and breakpoints'
        },
        {
          id: 'type-checking',
          name: 'Type Checking',
          description: 'Static type checking and type inference'
        },
        {
          id: 'preview',
          name: 'Live Preview',
          description: 'Real-time preview of code output'
        }
      ]
    },

    async getLanguageConfig(languageId: string) {
      const languages = await this.getSupportedLanguages()
      return languages.find(lang => lang.id === languageId)
    },

    async detectLanguage(content: string, filename?: string) {
      // Simple language detection based on file extension and content
      if (filename) {
        const ext = filename.toLowerCase().split('.').pop()
        const extensionMap = {
          'js': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'py': 'python',
          'java': 'java',
          'go': 'go',
          'cpp': 'cpp',
          'rs': 'rust',
          'php': 'php',
          'rb': 'ruby',
          'swift': 'swift',
          'kt': 'kotlin',
          'cs': 'csharp',
          'html': 'html',
          'css': 'css',
          'sql': 'sql',
          'json': 'json',
          'yaml': 'yaml',
          'yml': 'yaml',
          'md': 'markdown'
        }
        
        if (extensionMap[ext as keyof typeof extensionMap]) {
          return extensionMap[ext as keyof typeof extensionMap]
        }
      }

      // Content-based detection
      if (content.includes('function') || content.includes('const') || content.includes('let')) {
        if (content.includes(':') && content.includes('interface')) return 'typescript'
        return 'javascript'
      }
      if (content.includes('def ') || content.includes('import ')) return 'python'
      if (content.includes('public class') || content.includes('import java.')) return 'java'
      if (content.includes('package main') || content.includes('func main()')) return 'go'
      if (content.includes('#include') || content.includes('int main(')) return 'cpp'
      if (content.includes('fn main()') || content.includes('use std::')) return 'rust'
      if (content.includes('<!DOCTYPE') || content.includes('<html')) return 'html'
      if (content.includes('{') && content.includes('color:')) return 'css'
      if (content.includes('SELECT') || content.includes('FROM')) return 'sql'

      return 'plaintext'
    }
  }
}
