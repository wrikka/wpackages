import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { path: relativePath, type } = body

  if (!relativePath || !type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Path and type (file/folder) are required',
    })
  }

  const fullPath = path.join(projectRoot, relativePath)

  // Security check
  if (!fullPath.startsWith(projectRoot)) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  try {
    if (type === 'file') {
      await writeFile(fullPath, '', 'utf-8')
    } else if (type === 'folder') {
      await mkdir(fullPath, { recursive: true })
    }
    return { success: true, message: `${type} created at ${relativePath}` }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create ${type}: ${error.message}`,
    })
  }
})
