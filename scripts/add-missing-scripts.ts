#!/usr/bin/env bun
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, basename, relative } from 'path'

interface PackageJson {
  name: string
  scripts?: Record<string, string>
  type?: string
}

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
  
  if (relativePath.startsWith('apps/')) {
    return 'app'
  }
  
  if (relativePath.includes('examples/')) {
    return 'example'
  }
  
  if (relativePath.includes('config/')) {
    return 'config'
  }
  
  if (relativePath.includes('scripts/') || relativePath.includes('cli/')) {
    return 'tool'
  }
  
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

function addMissingScripts(packageJsonPath: string): boolean {
  try {
    const content = readFileSync(packageJsonPath, 'utf-8')
    const pkg: PackageJson = JSON.parse(content, null, 2)
    const scripts = pkg.scripts || {}
    const workspaceType = getWorkspaceType(packageJsonPath)
    const scriptsForType = getScriptsForType(workspaceType)
    
    let modified = false
    
    for (const [script, command] of Object.entries(scriptsForType)) {
      if (!scripts[script]) {
        if (!pkg.scripts) {
          pkg.scripts = {}
        }
        pkg.scripts[script] = command
        modified = true
        console.log(`  + Added ${script}: ${command}`)
      }
    }
    
    if (modified) {
      writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
      return true
    }
    
    return false
  } catch (error) {
    console.error(`  ❌ Error processing ${packageJsonPath}:`, error)
    return false
  }
}

function main() {
  const root = process.cwd()
  const appsDir = join(root, 'apps')
  const packagesDir = join(root, 'packages')
  
  console.log('🔧 Adding missing scripts to workspaces...\n')
  
  const appPackageJsons = findPackageJsons(appsDir)
  const packagePackageJsons = findPackageJsons(packagesDir)
  const allPackageJsons = [...appPackageJsons, ...packagePackageJsons]
  
  let modifiedCount = 0
  
  for (const packageJsonPath of allPackageJsons) {
    const workspaceName = basename(dirname(packageJsonPath))
    console.log(`\n📦 ${workspaceName}:`)
    
    const modified = addMissingScripts(packageJsonPath)
    
    if (modified) {
      modifiedCount++
    } else {
      console.log('  ✅ Already complete')
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total workspaces: ${allPackageJsons.length}`)
  console.log(`   Modified: ${modifiedCount}`)
  console.log(`   Unchanged: ${allPackageJsons.length - modifiedCount}`)
  
  if (modifiedCount > 0) {
    console.log(`\n✅ Done! ${modifiedCount} workspaces have been updated.`)
  } else {
    console.log(`\n✅ All workspaces already have required scripts!`)
  }
}

main()
