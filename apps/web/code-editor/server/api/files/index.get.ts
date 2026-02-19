import { readdir, stat } from 'fs/promises'
import path from 'path'
import { eq } from 'drizzle-orm'
import { db } from '~/server/utils/db'

// Define the root directory for the file explorer relative to the server file.
// In a real app, this should be a configurable and secure path.
const projectRoot = path.resolve(process.cwd())

async function readDirectory(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const tree = [];

  for (const entry of entries) {
    // Ignore node_modules and .git for performance and security
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.nuxt') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(projectRoot, fullPath);

    if (entry.isDirectory()) {
      tree.push({
        name: entry.name,
        path: relativePath,
        type: 'folder',
        children: await readDirectory(fullPath),
      });
    } else {
      tree.push({
        name: entry.name,
        path: relativePath,
        type: 'file',
      });
    }
  }
  return tree;
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const path = query.path as string || '/'

    const fileTree = await readDirectory(projectRoot);
    return {
      success: true,
      data: fileTree
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch files'
    })
  }
})
