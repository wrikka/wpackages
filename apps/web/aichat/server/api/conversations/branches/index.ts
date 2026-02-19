import { and, eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { conversationBranches } from '../../database/schema/features';

const branchSchema = z.object({
  parentConversationId: z.string(),
  branchName: z.string().min(1).max(100),
  branchPointMessageId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const { conversationId } = getQuery(event);

    if (!conversationId) {
      throw createError({ statusCode: 400, message: 'conversationId required' });
    }

    const branches = await db.query.conversationBranches.findMany({
      where: or(
        eq(conversationBranches.parentConversationId, conversationId as string),
        eq(conversationBranches.branchConversationId, conversationId as string),
      ),
      with: {
        parentConversation: true,
        branchConversation: true,
        branchPointMessage: true,
      },
      orderBy: (cb, { desc }) => [desc(cb.createdAt)],
    });

    return branches;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const { parentConversationId, branchName, branchPointMessageId } = branchSchema.parse(body);

    // Verify user owns the parent conversation
    const parentConv = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, parentConversationId),
        eq(conversations.userId, user.id),
      ),
    });

    if (!parentConv) {
      throw createError({ statusCode: 404, message: 'Parent conversation not found' });
    }

    // Create the branch conversation
    const newConversation = await db.insert(conversations).values({
      userId: user.id,
      title: `${parentConv.title} (Branch: ${branchName})`,
      systemPrompt: parentConv.systemPrompt,
      createdAt: new Date(),
    }).returning();

    // Create branch record
    const branch = await db.insert(conversationBranches).values({
      parentConversationId,
      branchConversationId: newConversation[0].id,
      branchPointMessageId,
      branchName,
    }).returning();

    // Copy messages up to branch point
    if (branchPointMessageId) {
      const messagesBeforeBranch = await db.query.messages.findMany({
        where: eq(messages.conversationId, parentConversationId),
        orderBy: (m, { asc }) => [asc(m.createdAt)],
      });

      const branchPointIndex = messagesBeforeBranch.findIndex(m => m.id === branchPointMessageId);
      const messagesToCopy = branchPointIndex >= 0
        ? messagesBeforeBranch.slice(0, branchPointIndex + 1)
        : messagesBeforeBranch;

      for (const msg of messagesToCopy) {
        await db.insert(messages).values({
          conversationId: newConversation[0].id,
          role: msg.role,
          content: msg.content,
          createdAt: new Date(),
        });
      }
    }

    return {
      branch: branch[0],
      conversation: newConversation[0],
    };
  }

  if (method === 'DELETE') {
    const { branchId } = getQuery(event);

    await db.delete(conversationBranches)
      .where(eq(conversationBranches.id, branchId as string));

    return { success: true };
  }
});
