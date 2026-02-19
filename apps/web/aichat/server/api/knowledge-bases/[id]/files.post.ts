import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { useDb } from '../../../composables';
import { knowledgeBaseFiles, knowledgeBases } from '../../../db';
import { processFile } from '../../../services/rag';

const FILE_ID_LENGTH = 15;
const FILENAME_ID_LENGTH = 15;

export default defineEventHandler(async (event) => {
  const { user } = event.context;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const kbId = getRouterParam(event, 'id');
  if (!kbId) {
    throw createError({ statusCode: 400, statusMessage: 'Knowledge Base ID is required' });
  }

  const db = await useDb();
  const kb = await db.query.knowledgeBases.findFirst({
    where: and(eq(knowledgeBases.id, kbId), eq(knowledgeBases.userId, user.id)),
  });

  if (!kb) {
    throw createError({
      statusCode: 404,
      statusMessage:
        'Knowledge Base not found or you do not have permission to upload files to it.',
    });
  }

  const formData = await readMultipartFormData(event);
  const file = formData?.find(item => item.name === 'file');

  if (!file || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' });
  }

  // Define storage path
  const uploadDir = resolve('.data/uploads', kbId);
  await mkdir(uploadDir, { recursive: true });
  const storagePath = resolve(uploadDir, `${generateId(FILENAME_ID_LENGTH)}-${file.filename}`);

  // Save the file
  await writeFile(storagePath, file.data);

  // Create a record in the database
  const newFile = {
    createdAt: new Date(),
    fileName: file.filename,
    id: generateId(FILE_ID_LENGTH),
    knowledgeBaseId: kbId,
    status: 'pending' as const,
    storagePath,
  };

  await db.insert(knowledgeBaseFiles).values(newFile);

  // Trigger background processing of the file
  processFile(newFile.id);

  return newFile;
});
