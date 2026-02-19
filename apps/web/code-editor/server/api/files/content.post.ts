import { writeFile } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { path: relativePath, content } = body

  if (!relativePath || content === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File path and content are required',
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
    await writeFile(fullPath, content, 'utf-8')
    return { success: true, message: `File ${relativePath} saved.` }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to save file: ${error.message}`,
    })
  }
})
