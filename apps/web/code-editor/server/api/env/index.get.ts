import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const projectRoot = path.resolve(process.cwd())
const envPath = path.join(projectRoot, '.env')

// Helper to parse .env file content
function parseEnv(content: string) {
  const envVars = {}
  for (const line of content.split('\n')) {
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    }
  }
  return envVars
}

// Helper to stringify an object to .env format
function stringifyEnv(envVars: Record<string, string>) {
  return Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

export default defineEventHandler(async (event) => {
  // Handle POST request to update the .env file
  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    try {
      const newContent = stringifyEnv(body)
      await writeFile(envPath, newContent, 'utf-8')
      return { success: true, message: '.env file updated!' }
    } catch (error) {
      throw createError({ statusCode: 500, statusMessage: `Failed to write .env file: ${error.message}` })
    }
  }

  // Handle GET request to read the .env file
  try {
    const fileContent = await readFile(envPath, 'utf-8')
    return parseEnv(fileContent)
  } catch (error) {
    // If the file doesn't exist, return an empty object
    if (error.code === 'ENOENT') {
      return {}
    }
    throw createError({ statusCode: 500, statusMessage: `Failed to read .env file: ${error.message}` })
  }
})
