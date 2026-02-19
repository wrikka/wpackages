import { eq } from 'drizzle-orm';
import { requireAuth, useDb } from '../../composables';
import { userIntegrations } from '../../db';

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const db = await useDb();

  const connectedIntegrations = await db.query.userIntegrations.findMany({
    where: eq(userIntegrations.userId, user.id),
  });

  // We can define a list of all possible integrations here
  const allPossibleIntegrations = [
    { id: 'github', provider: 'github', name: 'GitHub' },
    { id: 'google-drive', provider: 'google', name: 'Google Drive' },
    { id: 'google-calendar', provider: 'google', name: 'Google Calendar' },
  ];

  const result = allPossibleIntegrations.map(p => {
    const connected = connectedIntegrations.find(c => c.provider === p.provider);
    return {
      ...p,
      connected: !!connected,
      createdAt: connected?.createdAt,
    };
  });

  return result;
});
