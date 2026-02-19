import { readFile } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const relativePath = query.path as string

  if (!relativePath) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path is required',
    })
  }

  const fullPath = path.join(projectRoot, relativePath)

  // Security: Ensure the path is within the project root
  if (!fullPath.startsWith(projectRoot)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    })
  }

  try {
    const content = await readFile(fullPath, 'utf-8')
    return {
      path: relativePath,
      content,
    }
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: `File not found or could not be read: ${relativePath}`,
    })
  }
})
