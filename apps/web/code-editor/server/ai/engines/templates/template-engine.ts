import type { AITemplateRequest, AITemplateResponse } from '~/shared/types/ai'

export function createTemplateEngine() {
  return {
    async getTemplates(category?: string, language?: string) {
      const templates = [
        // Web Development Templates
        {
          id: 'react-typescript',
          name: 'React + TypeScript',
          description: 'Modern React application with TypeScript and Vite',
          category: 'web',
          language: 'typescript',
          framework: 'react',
          popularity: 95,
          difficulty: 'intermediate'
        },
        {
          id: 'vue3-typescript',
          name: 'Vue 3 + TypeScript',
          description: 'Vue 3 application with Composition API and TypeScript',
          category: 'web',
          language: 'typescript',
          framework: 'vue',
          popularity: 85,
          difficulty: 'intermediate'
        },
        {
          id: 'nextjs-fullstack',
          name: 'Next.js Full-Stack',
          description: 'Full-stack Next.js application with API routes',
          category: 'web',
          language: 'typescript',
          framework: 'nextjs',
          popularity: 90,
          difficulty: 'advanced'
        },
        {
          id: 'nuxt3-minimal',
          name: 'Nuxt 3 Minimal',
          description: 'Minimal Nuxt 3 application with modern setup',
          category: 'web',
          language: 'typescript',
          framework: 'nuxt',
          popularity: 80,
          difficulty: 'intermediate'
        },
        
        // Backend Templates
        {
          id: 'express-typescript',
          name: 'Express + TypeScript',
          description: 'RESTful API with Express.js and TypeScript',
          category: 'backend',
          language: 'typescript',
          framework: 'express',
          popularity: 85,
          difficulty: 'intermediate'
        },
        {
          id: 'fastapi-python',
          name: 'FastAPI Python',
          description: 'Modern Python web API with FastAPI',
          category: 'backend',
          language: 'python',
          framework: 'fastapi',
          popularity: 75,
          difficulty: 'intermediate'
        },
        {
          id: 'go-gin',
          name: 'Go + Gin',
          description: 'High-performance Go web API with Gin framework',
          category: 'backend',
          language: 'go',
          framework: 'gin',
          popularity: 60,
          difficulty: 'advanced'
        },
        
        // Desktop Templates
        {
          id: 'tauri-react',
          name: 'Tauri + React',
          description: 'Cross-platform desktop app with Tauri and React',
          category: 'desktop',
          language: 'typescript',
          framework: 'tauri',
          popularity: 70,
          difficulty: 'advanced'
        },
        {
          id: 'electron-vue',
          name: 'Electron + Vue',
          description: 'Desktop application with Electron and Vue 3',
          category: 'desktop',
          language: 'typescript',
          framework: 'electron',
          popularity: 65,
          difficulty: 'intermediate'
        },
        
        // Mobile Templates
        {
          id: 'react-native-typescript',
          name: 'React Native + TypeScript',
          description: 'Cross-platform mobile app with React Native',
          category: 'mobile',
          language: 'typescript',
          framework: 'react-native',
          popularity: 80,
          difficulty: 'advanced'
        },
        {
          id: 'flutter-dart',
          name: 'Flutter',
          description: 'Beautiful mobile apps with Flutter and Dart',
          category: 'mobile',
          language: 'dart',
          framework: 'flutter',
          popularity: 75,
          difficulty: 'intermediate'
        },
        
        // CLI Templates
        {
          id: 'node-cli-typescript',
          name: 'Node.js CLI + TypeScript',
          description: 'Command-line tool with Node.js and TypeScript',
          category: 'cli',
          language: 'typescript',
          framework: 'commander',
          popularity: 70,
          difficulty: 'intermediate'
        },
        {
          id: 'python-click',
          name: 'Python CLI with Click',
          description: 'Python command-line interface with Click library',
          category: 'cli',
          language: 'python',
          framework: 'click',
          popularity: 65,
          difficulty: 'beginner'
        },
        
        // Library Templates
        {
          id: 'typescript-library',
          name: 'TypeScript Library',
          description: 'Modern TypeScript library with testing and docs',
          category: 'library',
          language: 'typescript',
          framework: 'rollup',
          popularity: 85,
          difficulty: 'intermediate'
        },
        {
          id: 'rust-library',
          name: 'Rust Library',
          description: 'Rust library with Cargo and documentation',
          category: 'library',
          language: 'rust',
          framework: 'cargo',
          popularity: 55,
          difficulty: 'advanced'
        }
      ]

      let filteredTemplates = templates

      if (category) {
        filteredTemplates = filteredTemplates.filter(t => t.category === category)
      }

      if (language) {
        filteredTemplates = filteredTemplates.filter(t => t.language === language)
      }

      return filteredTemplates
    },

    async getCategories() {
      return [
        {
          id: 'web',
          name: 'Web Development',
          description: 'Frontend and full-stack web applications',
          icon: 'globe'
        },
        {
          id: 'backend',
          name: 'Backend APIs',
          description: 'Server-side applications and APIs',
          icon: 'server'
        },
        {
          id: 'desktop',
          name: 'Desktop Apps',
          description: 'Cross-platform desktop applications',
          icon: 'desktop'
        },
        {
          id: 'mobile',
          name: 'Mobile Apps',
          description: 'iOS and Android applications',
          icon: 'smartphone'
        },
        {
          id: 'cli',
          name: 'Command Line',
          description: 'CLI tools and utilities',
          icon: 'terminal'
        },
        {
          id: 'library',
          name: 'Libraries',
          description: 'Reusable libraries and packages',
          icon: 'package'
        }
      ]
    },

    async generateProject(request: AITemplateRequest) {
      const template = await this.getTemplateById(request.templateId)
      if (!template) {
        throw new Error(`Template ${request.templateId} not found`)
      }

      const files = await this.generateTemplateFiles(template, request)
      const instructions = await this.generateInstructions(template, request)

      return {
        project: {
          name: request.projectName,
          type: template.category,
          description: template.description,
          language: template.language
        },
        files,
        instructions
      }
    },

    async getTemplateById(templateId: string) {
      const templates = await this.getTemplates()
      return templates.find(t => t.id === templateId)
    },

    async generateTemplateFiles(template: any, request: AITemplateRequest) {
      const options = request.options || {}
      const projectName = request.projectName

      switch (template.id) {
        case 'react-typescript':
          return this.generateReactTypeScriptFiles(projectName, options)
        
        case 'vue3-typescript':
          return this.generateVue3TypeScriptFiles(projectName, options)
        
        case 'nextjs-fullstack':
          return this.generateNextJSFiles(projectName, options)
        
        case 'express-typescript':
          return this.generateExpressTypeScriptFiles(projectName, options)
        
        case 'fastapi-python':
          return this.generateFastAPIFiles(projectName, options)
        
        default:
          return this.generateGenericFiles(projectName, template, options)
      }
    },

    async generateReactTypeScriptFiles(projectName: string, options: any) {
      const files = [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName,
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'tsc && vite build',
              preview: 'vite preview',
              test: options.includeTests ? 'vitest' : undefined
            },
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0'
            },
            devDependencies: {
              '@types/react': '^18.2.0',
              '@types/react-dom': '^18.2.0',
              '@vitejs/plugin-react': '^4.0.0',
              typescript: '^5.0.0',
              vite: '^4.4.0',
              ...(options.includeTests && { vitest: '^0.34.0', '@testing-library/react': '^13.4.0' })
            }
          }, null, 2),
          type: 'file'
        },
        {
          path: 'tsconfig.json',
          content: JSON.stringify({
            compilerOptions: {
              target: 'ES2020',
              useDefineForClassFields: true,
              lib: ['ES2020', 'DOM', 'DOM.Iterable'],
              module: 'ESNext',
              skipLibCheck: true,
              moduleResolution: 'bundler',
              allowImportingTsExtensions: true,
              resolveJsonModule: true,
              isolatedModules: true,
              noEmit: true,
              jsx: 'react-jsx',
              strict: true,
              noUnusedLocals: true,
              noUnusedParameters: true,
              noFallthroughCasesInSwitch: true
            },
            include: ['src'],
            references: [{ path: './tsconfig.node.json' }]
          }, null, 2),
          type: 'file'
        },
        {
          path: 'vite.config.ts',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})`,
          type: 'file'
        },
        {
          path: 'src/App.tsx',
          content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>${projectName}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
          type: 'file'
        },
        {
          path: 'src/main.tsx',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
          type: 'file'
        },
        {
          path: 'src/App.css',
          content: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}`,
          type: 'file'
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
          type: 'file'
        }
      ]

      if (options.includeTests) {
        files.push({
          path: 'src/App.test.tsx',
          content: `import { render, screen } from '@testing-library/react'
import { useState } from 'react'
import App from './App'

test('renders app with title', () => {
  render(<App />)
  const titleElement = screen.getByText(/${projectName}/i)
  expect(titleElement).toBeInTheDocument()
})

test('counter increments when clicked', () => {
  render(<App />)
  const button = screen.getByRole('button', { name: /count is/i })
  
  // Initial state
  expect(button).toHaveTextContent('count is 0')
  
  // Click button
  button.click()
  
  // State should increment
  expect(button).toHaveTextContent('count is 1')
})`,
          type: 'file'
        })
      }

      return files
    },

    async generateVue3TypeScriptFiles(projectName: string, options: any) {
      return [
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName,
            version: '0.1.0',
            type: 'module',
            scripts: {
              dev: 'nuxt dev',
              build: 'nuxt build',
              preview: 'nuxt preview',
              test: options.includeTests ? 'vitest' : undefined
            },
            dependencies: {
              vue: '^3.3.0',
              'vue-router': '^4.2.0'
            },
            devDependencies: {
              '@nuxt/devtools': '^1.0.0',
              '@nuxt/typescript': '^2.0.0',
              nuxt: '^3.8.0',
              typescript: '^5.0.0',
              vue-tsc: '^1.8.0',
              ...(options.includeTests && { vitest: '^0.34.0', '@vue/test-utils': '^2.4.0' })
            }
          }, null, 2),
          type: 'file'
        },
        {
          path: 'nuxt.config.ts',
          content: `export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: {
    shim: false
  }
})`,
          type: 'file'
        },
        {
          path: 'app.vue',
          content: `<template>
  <div>
    <h1>{{ projectName }}</h1>
    <div class="counter">
      <button @click="count++">
        Count is: {{ count }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const projectName = '${projectName}'
const count = ref(0)
</script>

<style>
.counter {
  padding: 2em;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  background-color: #1a1a1a;
  color: white;
  cursor: pointer;
}
</style>`,
          type: 'file'
        }
      ]
    },

    async generateInstructions(template: any, request: AITemplateRequest) {
      const options = request.options || {}
      const packageManager = options.packageManager || 'npm'

      return {
        setup: [
          `cd ${request.projectName}`,
          `${packageManager} install`,
          `${packageManager} run dev`
        ],
        run: [
          `${packageManager} run dev`,
          `${packageManager} run build`,
          `${packageManager} run preview`
        ],
        test: options.includeTests ? [
          `${packageManager} test`,
          `${packageManager} run test:watch`
        ] : [],
        deploy: [
          `${packageManager} run build`,
          'Deploy the dist/ folder to your hosting provider'
        ]
      }
    },

    async generateGenericFiles(projectName: string, template: any, options: any) {
      return [
        {
          path: 'README.md',
          content: `# ${projectName}

${template.description}

## Getting Started

1. Install dependencies
2. Run the development server
3. Open your browser

## Features

- Modern ${template.language} setup
- ${template.framework} integration
- Type safety
- Hot reload
`,
          type: 'file'
        },
        {
          path: '.gitignore',
          content: `node_modules/
dist/
.env
.env.local
.env.*.local
*.log
.DS_Store
`,
          type: 'file'
        }
      ]
    }
  }
}
