#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// รายการชื่อเดิมและชื่อใหม่
const nameChanges = {
  '@wpackages/github': '@wpackages/github-cli',
  '@wpackages/analytics-app': '@wpackages/web-analytics',
  '@wpackages/config-tsconfig': '@wpackages/tsconfig',
  '@wpackages/macros-bun': '@wpackages/bun',
  '@wpackages/macros-vue': '@wpackages/vue',
  '@wpackages/reporter-devtool': '@wpackages/reporter',
  '@wpackages/tui-react': '@wpackages/tui',
  '@w/update-deps': '@wpackages/update-deps',
  '@wpackages/signal': '@wpackages/palse',
  'devtools': '@wpackages/devtools',
  'tracing-ui': '@wpackages/tracing-ui'
}

// ฟังก์ชันสำหรับหา package.json ทั้งหมด
function findPackageJsonFiles(dir: string): string[] {
  const files: string[] = []
  const { readdirSync, statSync } = require('fs')
  const { join } = require('path')
  
  const entries = readdirSync(dir)
  
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git' || 
          entry === 'examples' || entry === 'pkg' || entry === '.turbo') {
        continue
      }
      files.push(...findPackageJsonFiles(fullPath))
    } else if (entry === 'package.json') {
      files.push(fullPath)
    }
  }
  
  return files
}

// หา package.json ทั้งหมด
const packageJsonFiles = findPackageJsonFiles(rootDir)

console.log(`พบ ${packageJsonFiles.length} ไฟล์ package.json`)

// ตรวจสอบและแก้ไขแต่ละไฟล์
const changes: Array<{ file: string; oldName: string; newName: string }> = []

for (const file of packageJsonFiles) {
  try {
    const content = readFileSync(file, 'utf-8')
    const pkg = JSON.parse(content)
    
    let hasChanges = false
    
    // ตรวจสอบ dependencies
    if (pkg.dependencies) {
      for (const [key, value] of Object.entries(pkg.dependencies)) {
        if (nameChanges[key] && value === 'workspace:*') {
          console.log(`📝 ${file.replace(rootDir, '')}:`)
          console.log(`   dependencies.${key} -> ${nameChanges[key]}`)
          pkg.dependencies[nameChanges[key]] = value
          delete pkg.dependencies[key]
          hasChanges = true
        }
      }
    }
    
    // ตรวจสอบ devDependencies
    if (pkg.devDependencies) {
      for (const [key, value] of Object.entries(pkg.devDependencies)) {
        if (nameChanges[key] && value === 'workspace:*') {
          console.log(`📝 ${file.replace(rootDir, '')}:`)
          console.log(`   devDependencies.${key} -> ${nameChanges[key]}`)
          pkg.devDependencies[nameChanges[key]] = value
          delete pkg.devDependencies[key]
          hasChanges = true
        }
      }
    }
    
    if (hasChanges) {
      writeFileSync(file, JSON.stringify(pkg, null, '\t') + '\n')
      changes.push({
        file: file.replace(rootDir, ''),
        oldName: 'multiple',
        newName: 'multiple'
      })
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error)
  }
}

console.log(`\n✅ แก้ไข ${changes.length} ไฟล์`)
