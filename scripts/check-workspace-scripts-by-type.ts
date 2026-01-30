#!/usr/bin/env bun
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, basename, relative } from 'path'

interface PackageJson {
  name: string
  scripts?: Record<string, string>
  type?: string
}

const requiredScripts = ['watch', 'dev', 'format', 'lint', 'test', 'build']

function findPackageJsons(dir: string, excludePatterns: string[] = ['node_modules']): string[] {
  const results: string[] = []
  
  function scan(currentDir: string) {
    try {
      const entries = readdirSync(currentDir)
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry)
        const stat = statSync(fullPath)
        
        if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue
        }
        
        if (stat.isDirectory()) {
          scan(fullPath)
        } else if (entry === 'package.json') {
          results.push(fullPath)
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scan(dir)
  return results
}

function getWorkspaceType(path: string): 'app' | 'lib' | 'config' | 'example' | 'tool' {
  const relativePath = relative(process.cwd(), dirname(path))
  
  // Check if it's an app
  if (relativePath.startsWith('apps/')) {
    return 'app'
  }
  
  // Check if it's an example
  if (relativePath.includes('examples/')) {
    return 'example'
  }
  
  // Check if it's a config package
  if (relativePath.includes('config/')) {
    return 'config'
  }
  
  // Check if it's a tool/script
  if (relativePath.includes('scripts/') || relativePath.includes('cli/')) {
    return 'tool'
  }
  
  // Default to lib
  return 'lib'
}

function getScriptsForType(type: string): Record<string, string> {
  switch (type) {
    case 'app':
      return {
        watch: 'bun --watch verify',
        dev: 'bun dev',
        format: 'dprint fmt',
        lint: 'oxlint --fix',
        test: 'vitest run',
        build: 'bun build'
      }
    case 'lib':
      return {
        watch: 'bun --watch src/index.ts',
        dev: 'bun run src/index.ts',
        format: 'dprint fmt',
        lint: 'oxlint --fix',
        test: 'vitest run',
        build: 'tsdown --exports --dts --minify'
      }
    case 'config':
      return {
        watch: 'echo "No watch needed"',
        dev: 'echo "No dev needed"',
        format: 'dprint fmt',
        lint: 'oxlint --fix',
        test: 'vitest run',
        build: 'echo "No build needed"'
      }
    case 'example':
      return {
        watch: 'bun --watch src/index.ts',
        dev: 'bun dev',
        format: 'dprint fmt',
        lint: 'oxlint --fix',
        test: 'vitest run',
        build: 'bun build'
      }
    case 'tool':
      return {
        watch: 'bun --watch src/index.ts',
        dev: 'bun run src/index.ts',
        format: 'dprint fmt',
        lint: 'oxlint --fix',
        test: 'vitest run',
        build: 'tsdown --exports --dts --minify'
      }
    default:
      return {}
  }
}

function checkWorkspaceScripts(packageJsonPath: string): { 
  missing: string[]; 
  hasAll: boolean;
  workspaceType: string;
  requiredScriptsForType: string[];
} {
  try {
    const content = readFileSync(packageJsonPath, 'utf-8')
    const pkg: PackageJson = JSON.parse(content)
    const scripts = pkg.scripts || {}
    const workspaceType = getWorkspaceType(packageJsonPath)
    const scriptsForType = getScriptsForType(workspaceType)
    const requiredScriptsForType = Object.keys(scriptsForType)
    
    const missing = requiredScriptsForType.filter(script => !scripts[script])
    
    return {
      missing,
      hasAll: missing.length === 0,
      workspaceType,
      requiredScriptsForType
    }
  } catch (error) {
    const workspaceType = getWorkspaceType(packageJsonPath)
    const scriptsForType = getScriptsForType(workspaceType)
    
    return {
      missing: Object.keys(scriptsForType),
      hasAll: false,
      workspaceType,
      requiredScriptsForType: Object.keys(scriptsForType)
    }
  }
}

function main() {
  const root = process.cwd()
  const appsDir = join(root, 'apps')
  const packagesDir = join(root, 'packages')
  
  console.log('🔍 Checking workspace scripts by type...\n')
  
  const appPackageJsons = findPackageJsons(appsDir)
  const packagePackageJsons = findPackageJsons(packagesDir)
  const allPackageJsons = [...appPackageJsons, ...packagePackageJsons]
  
  let totalWorkspaces = 0
  let completeWorkspaces = 0
  const incompleteWorkspaces: { 
    path: string; 
    missing: string[]; 
    type: string;
  }[] = []
  
  for (const packageJsonPath of allPackageJsons) {
    const workspaceName = basename(dirname(packageJsonPath))
    const { missing, hasAll, workspaceType, requiredScriptsForType } = checkWorkspaceScripts(packageJsonPath)
    
    totalWorkspaces++
    
    if (hasAll) {
      console.log(`✅ [${workspaceType}] ${workspaceName}`)
      completeWorkspaces++
    } else {
      console.log(`❌ [${workspaceType}] ${workspaceName} - Missing: ${missing.join(', ')}`)
      incompleteWorkspaces.push({
        path: packageJsonPath,
        missing,
        type: workspaceType
      })
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total: ${totalWorkspaces}`)
  console.log(`   ✅ Complete: ${completeWorkspaces}`)
  console.log(`   ❌ Incomplete: ${incompleteWorkspaces.length}`)
  
  if (incompleteWorkspaces.length > 0) {
    console.log(`\n📋 Incomplete workspaces by type:`)
    const byType = incompleteWorkspaces.reduce((acc, ws) => {
      if (!acc[ws.type]) acc[ws.type] = []
      acc[ws.type].push(ws)
      return acc
    }, {} as Record<string, typeof incompleteWorkspaces>)
    
    for (const [type, workspaces] of Object.entries(byType)) {
      console.log(`\n   ${type}:`)
      for (const ws of workspaces) {
        console.log(`     - ${basename(dirname(ws.path))}`)
        console.log(`       Missing: ${ws.missing.join(', ')}`)
      }
    }
    process.exit(1)
  } else {
    console.log(`\n🎉 All workspaces have required scripts!`)
  }
}

main()
