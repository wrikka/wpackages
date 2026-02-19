import { readFile } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())

export default defineEventHandler(async (event) => {
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json')
    const fileContent = await readFile(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(fileContent)

    return packageJson.scripts || {}
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to read package.json: ${error.message}`,
    })
  }
})
