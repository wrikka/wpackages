#!/usr/bin/env bun
import { existsSync } from 'fs'
import { join, dirname, basename, relative } from 'path'

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

function checkWorkspaceFiles(packageJsonPath: string): { hasReadme: boolean; hasGitignore: boolean; missing: string[] } {
  const workspaceDir = dirname(packageJsonPath)
  const readmePath = join(workspaceDir, 'README.md')
  const gitignorePath = join(workspaceDir, '.gitignore')
  
  const hasReadme = existsSync(readmePath)
  const hasGitignore = existsSync(gitignorePath)
  const missing: string[] = []
  
  if (!hasReadme) missing.push('README.md')
  if (!hasGitignore) missing.push('.gitignore')
  
  return {
    hasReadme,
    hasGitignore,
    missing
  }
}

function main() {
  const root = process.cwd()
  const appsDir = join(root, 'apps')
  const packagesDir = join(root, 'packages')
  
  console.log('🔍 Checking workspace files (README.md, .gitignore)...\n')
  
  const appPackageJsons = findPackageJsons(appsDir)
  const packagePackageJsons = findPackageJsons(packagesDir)
  const allPackageJsons = [...appPackageJsons, ...packagePackageJsons]
  
  let totalWorkspaces = 0
  let completeWorkspaces = 0
  const incompleteWorkspaces: { path: string; missing: string[] }[] = []
  
  for (const packageJsonPath of allPackageJsons) {
    const workspaceName = basename(dirname(packageJsonPath))
    const { hasReadme, hasGitignore, missing } = checkWorkspaceFiles(packageJsonPath)
    
    totalWorkspaces++
    
    if (hasReadme && hasGitignore) {
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
      console.log(`   - ${basename(dirname(path))}`)
      console.log(`     Missing: ${missing.join(', ')}`)
    })
    process.exit(1)
  } else {
    console.log(`\n🎉 All workspaces have required files!`)
  }
}

main()
