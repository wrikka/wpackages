import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export default defineEventHandler(async (event) => {
  // Note: In a real app, be very careful with path traversal vulnerabilities.
  const query = getQuery(event);
  const path = query.path ? String(query.path) : '';
  const projectRoot = resolve(process.cwd());
  const targetPath = resolve(projectRoot, path);

  // Security check to prevent accessing files outside the project root
  if (!targetPath.startsWith(projectRoot)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    });
  }

  try {
    const files = await readdir(targetPath, { withFileTypes: true });
    const fileList = files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
    }));
    return fileList;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list files',
      data: message,
    });
  }
});
