import { rm } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { path: relativePath } = body

  if (!relativePath) {
    throw createError({ statusCode: 400, statusMessage: 'Path is required' })
  }

  const fullPath = path.join(projectRoot, relativePath)

  // Security check
  if (!fullPath.startsWith(projectRoot)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  try {
    await rm(fullPath, { recursive: true, force: true })
    return { success: true, message: `Path ${relativePath} deleted.` }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete path: ${error.message}`,
    })
  }
})
