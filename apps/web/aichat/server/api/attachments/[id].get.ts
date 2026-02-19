import { and, eq } from 'drizzle-orm';
import { createReadStream } from 'node:fs';

import { requireOrg, useDb } from '../../composables';
import { attachments } from '../../db';
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  requireOrg(event);

  const attachmentId = getRouterParam(event, 'id');
  if (!attachmentId) {
    throw createError({ statusCode: 400, statusMessage: 'Attachment ID is required' });
  }

  const db = useDb();
  const attachment = await db.query.attachments.findFirst({
    where: and(
      eq(attachments.id, attachmentId),
      eq(attachments.organizationId, event.context.org.id),
      eq(attachments.userId, user.id),
    ),
  });

  if (!attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Attachment not found' });
  }

  setHeader(event, 'Content-Type', attachment.fileType);
  setHeader(event, 'Content-Disposition', `inline; filename="${attachment.fileName}"`);

  return sendStream(event, createReadStream(attachment.filePath));
});
