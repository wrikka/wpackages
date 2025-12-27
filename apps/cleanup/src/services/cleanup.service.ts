import { glob } from 'glob'
import { rimraf } from 'rimraf'
import { stat, readdir } from 'node:fs/promises'
import path from 'node:path'

export interface CleanableItem {
  path: string
  size: number
}

interface CleanupResult {
  status: 'fulfilled' | 'rejected'
  path: string
  reason?: unknown
}

const getDirectorySize = async (dirPath: string): Promise<number> => {
  try {
    const files = await readdir(dirPath, { withFileTypes: true })
    const sizes = await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(dirPath, file.name)
            if (file.isDirectory()) {
                // Avoid deep recursion into nested node_modules, which can be very slow.
                return getDirectorySize(filePath)
            }
            else {
                const stats = await stat(filePath)
                return stats.size
            }
        }),
    )
    return sizes.reduce((acc, size) => acc + size, 0)
  } catch (error) {
    // If we can't read a directory, assume size is 0 and log the error.
    console.error(`Could not read directory ${dirPath}:`, error)
    return 0
  }
}

export const findCleanableItems = async (patterns: string[], basePath: string, excludePatterns: string[]): Promise<CleanableItem[]> => {
  const paths = await glob(patterns, { dot: true, ignore: excludePatterns, cwd: basePath, absolute: true })

  const items = await Promise.all(
    paths.map(async (absolutePath) => {
      try {
        const stats = await stat(absolutePath)
        const size = stats.isDirectory() ? await getDirectorySize(absolutePath) : stats.size
        return { path: absolutePath, size }
      } catch (error) {
        console.error(`Could not stat path ${absolutePath}:`, error)
        return { path: absolutePath, size: 0 } // Return with size 0 if stat fails
      }
    }),
  )

  // Filter out items with size 0, as they might be non-existent or inaccessible
  return items.filter(item => item.size > 0)
}

export const cleanup = async (targets: string[]): Promise<CleanupResult[]> => {
  const results = await Promise.allSettled(
    targets.map(path => rimraf(path).then(() => path)),
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return { status: 'fulfilled', path: result.value as string }
    }
    else {
      return { status: 'rejected', path: targets[index], reason: result.reason }
    }
  })
};
