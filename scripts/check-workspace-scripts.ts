#!/usr/bin/env bun
import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'

interface PackageJson {
  name: string
  scripts?: Record<string, string>
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
        
        // Skip excluded patterns
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

function checkWorkspaceScripts(packageJsonPath: string): { missing: string[]; hasAll: boolean } {
  try {
    const content = readFileSync(packageJsonPath, 'utf-8')
    const pkg: PackageJson = JSON.parse(content)
    const scripts = pkg.scripts || {}
    
    const missing = requiredScripts.filter(script => !scripts[script])
    
    return {
      missing,
      hasAll: missing.length === 0
    }
  } catch (error) {
    return {
      missing: requiredScripts,
      hasAll: false
    }
  }
}

function main() {
  const root = process.cwd()
  const appsDir = join(root, 'apps')
  const packagesDir = join(root, 'packages')
  
  console.log('🔍 Checking workspace scripts...\n')
  
  const appPackageJsons = findPackageJsons(appsDir)
  const packagePackageJsons = findPackageJsons(packagesDir)
  const allPackageJsons = [...appPackageJsons, ...packagePackageJsons]
  
  let totalWorkspaces = 0
  let completeWorkspaces = 0
  const incompleteWorkspaces: { path: string; missing: string[] }[] = []
  
  for (const packageJsonPath of allPackageJsons) {
    const workspaceName = basename(dirname(packageJsonPath))
    const { missing, hasAll } = checkWorkspaceScripts(packageJsonPath)
    
    totalWorkspaces++
    
    if (hasAll) {
      console.log(`✅ ${workspaceName}`)
      completeWorkspaces++
    } else {
      console.log(`❌ ${workspaceName} - Missing: ${missing.join(', ')}`)
      incompleteWorkspaces.push({
        path: packageJsonPath,
        missing
      })
    }
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total: ${totalWorkspaces}`)
  console.log(`   ✅ Complete: ${completeWorkspaces}`)
  console.log(`   ❌ Incomplete: ${incompleteWorkspaces.length}`)
  
  if (incompleteWorkspaces.length > 0) {
    console.log(`\n📋 Incomplete workspaces:`)
    incompleteWorkspaces.forEach(({ path, missing }) => {
      console.log(`   - ${path}`)
      console.log(`     Missing: ${missing.join(', ')}`)
    })
    process.exit(1)
  } else {
    console.log(`\n🎉 All workspaces have required scripts!`)
  }
}

main()
