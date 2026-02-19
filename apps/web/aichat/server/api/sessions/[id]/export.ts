import { eq, and } from 'drizzle-orm';
import { chatSessions, messages } from '../../../db';
import { createApiHandler, getEntityById, createSuccessResponse } from '../../../utils/api-helpers';

export default createApiHandler(async ({ db, org }, event) => {
  const id = getRouterParam(event, 'id');
  const format = getQuery(event).format as 'json' | 'markdown' | 'pdf';

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required' });
  }

  const session = await getEntityById(db, chatSessions, id, org.id);
  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' });
  }

  const sessionMessages = await db.query.messages.findMany({
    where: eq(messages.chatSessionId, id),
    orderBy: (messages) => [messages.timestamp],
  });

  const exportData = {
    session,
    messages: sessionMessages,
  };

  if (format === 'json') {
    return createSuccessResponse(exportData);
  }

  if (format === 'markdown') {
    let markdown = `# ${session.title}\n\n`;
    markdown += `Date: ${new Date(session.createdAt).toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    for (const msg of sessionMessages) {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      markdown += `## ${role}\n\n${msg.content}\n\n`;
    }

    return createSuccessResponse(markdown);
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid format' });
});
