import { rename } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { oldPath: oldRelativePath, newPath: newRelativePath } = body

  if (!oldRelativePath || !newRelativePath) {
    throw createError({ statusCode: 400, statusMessage: 'Old and new paths are required' })
  }

  const oldFullPath = path.join(projectRoot, oldRelativePath)
  const newFullPath = path.join(projectRoot, newRelativePath)

  // Security checks
  if (!oldFullPath.startsWith(projectRoot) || !newFullPath.startsWith(projectRoot)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  try {
    await rename(oldFullPath, newFullPath)
    return { success: true, message: `Renamed ${oldRelativePath} to ${newRelativePath}` }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to rename: ${error.message}`,
    })
  }
})
