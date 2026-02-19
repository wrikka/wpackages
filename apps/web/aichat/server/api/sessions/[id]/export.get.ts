import { and, eq } from 'drizzle-orm';

import { chatSessions, messages } from '@aichat/db';
import { requireAuth, useDb } from '../../../composables';

const toMarkdown = (session, messageList) => {
  let md = `# Chat Session: ${session.title || 'Untitled Session'}\n\n`;
  md += `**Session ID:** ${session.id}\n`;
  md += `**Created At:** ${new Date(session.createdAt).toLocaleString()}\n\n---\n\n`;

  for (const message of messageList) {
    const author = message.role === 'user' ? 'User' : 'Assistant';
    const timestamp = new Date(message.timestamp).toLocaleString();
    md += `**[${timestamp}] ${author}:**\n`;
    md += `${message.content || ''}\n\n`;
  }

  return md;
};

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const sessionId = getRouterParam(event, 'id');
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session ID is required' });
  }

  const db = await useDb();

  const session = await db.query.chatSessions.findFirst({
    where: and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, user.id)),
  });

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'Session not found' });
  }

  const messageList = await db.query.messages.findMany({
    where: eq(messages.chatSessionId, sessionId),
    orderBy: (msgs, { asc }) => [asc(msgs.timestamp)],
  });

  const markdownContent = toMarkdown(session, messageList);

  const safeTitle = (session.title || 'Untitled_Session').replace(/\s+/g, '_');
  const fileName = `aichat-session-${safeTitle}-${new Date().toISOString()}.md`;
  setHeader(event, 'Content-Disposition', `attachment; filename="${fileName}"`);
  setHeader(event, 'Content-Type', 'text/markdown');

  return markdownContent;
});
