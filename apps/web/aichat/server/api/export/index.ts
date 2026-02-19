import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const exportSchema = z.object({
  conversationId: z.string(),
  format: z.enum(['markdown', 'json', 'txt']),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const db = useDb();
  const body = await readBody(event);
  const { conversationId, format } = exportSchema.parse(body);

  // Verify ownership
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, user.id),
    ),
    with: { messages: true },
  });

  if (!conversation) throw createError({ statusCode: 404, message: 'Conversation not found' });

  let content = '';
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `conversation-${conversationId}-${timestamp}`;

  if (format === 'markdown') {
    content = `# ${conversation.title}\n\n`;
    content += `*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
    for (const msg of conversation.messages) {
      const role = msg.role === 'user' ? '**User**' : '**Assistant**';
      content += `## ${role} (${
        new Date(msg.createdAt).toLocaleString()
      })\n\n${msg.content}\n\n---\n\n`;
    }
    setResponseHeader(event, 'Content-Type', 'text/markdown');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}.md"`);
  } else if (format === 'json') {
    content = JSON.stringify(conversation, null, 2);
    setResponseHeader(event, 'Content-Type', 'application/json');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}.json"`);
  } else {
    content = `${conversation.title}\n\n`;
    for (const msg of conversation.messages) {
      content += `[${msg.role.toUpperCase()}]: ${msg.content}\n\n`;
    }
    setResponseHeader(event, 'Content-Type', 'text/plain');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${filename}.txt"`);
  }

  return content;
});
