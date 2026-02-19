import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import { requireAuth, requireOrg, useDb } from '../../composables';
import { agents, chatSessions } from '../../db';
export default defineEventHandler(async (event) => {
  const user = requireAuth(event);

  const body = await readBody(event);
  const title = body.title || 'New Chat';
  const model = body.model || 'gpt-3.5-turbo';
  const agentId = body.agentId;

  const db = useDb();
  requireOrg(event);

  let systemPrompt: string | null = null;
  if (agentId) {
    const agent = await db.query.agents.findFirst({
      where: and(
        eq(agents.id, agentId),
        eq(agents.organizationId, event.context.org.id),
      ),
    });

    if (agent) {
      systemPrompt = agent.systemPrompt;
    }
  }

  const newSession = {
    id: generateId(15),
    organizationId: event.context.org.id,
    userId: user.id,
    title,
    model,
    systemPrompt,
    agentId,
    pinned: 0,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(chatSessions).values(newSession);

  return newSession;
});
