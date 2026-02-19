import { generateId } from 'lucia';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { requireOrg, useDb } from '../../composables';
import { attachments } from '../../db';
import { extractTextFromFile } from '../../services/fileParser';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  requireOrg(event);

  const formData = await readMultipartFormData(event);
  const file = formData?.find(item => item.name === 'file');

  if (!file || !file.filename) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' });
  }

  const db = useDb();

  const uploadDir = resolve('.data/uploads/attachments', event.context.org.id);
  await mkdir(uploadDir, { recursive: true });

  const attachmentId = generateId(15);
  const storageFileName = `${attachmentId}-${file.filename}`;
  const storagePath = resolve(uploadDir, storageFileName);

  await writeFile(storagePath, file.data);

  const textContent = await extractTextFromFile(file.type || '', file.data);

  const record = {
    textContent,
    id: attachmentId,
    organizationId: event.context.org.id,
    userId: user.id,
    fileName: file.filename,
    fileType: file.type || 'application/octet-stream',
    filePath: storagePath,
    fileSize: file.data.byteLength,
    createdAt: new Date(),
  };

  await db.insert(attachments).values(record);

  return {
    ...record,
    url: `/api/attachments/${attachmentId}`,
  };
});
