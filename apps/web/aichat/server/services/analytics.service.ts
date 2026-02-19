import { eq, and, sql, count } from 'drizzle-orm';
import { usageStats, agentStats, messages, chatSessions } from '../db';
import { analyticsQuerySchema } from '../utils/validation-schemas';

export async function getUsageStats(
  organizationId: string,
  filters: any = {}
) {
  const db = useDb();
  const validated = analyticsQuerySchema.parse(filters);

  const conditions = [eq(usageStats.organizationId, organizationId)];

  if (validated.startDate) {
    conditions.push(sql`${usageStats.date} >= ${validated.startDate}`);
  }
  if (validated.endDate) {
    conditions.push(sql`${usageStats.date} <= ${validated.endDate}`);
  }
  if (validated.agentId) {
    conditions.push(eq(usageStats.agentId, validated.agentId));
  }

  const stats = await db.query.usageStats.findMany({
    where: and(...conditions),
    orderBy: (usageStats) => [usageStats.date],
  });

  return stats;
}

export async function getAgentStats(organizationId: string) {
  const db = useDb();

  const stats = await db.query.agentStats.findMany({
    where: eq(agentStats.organizationId, organizationId),
    orderBy: (agentStats) => [agentStats.usageCount],
  });

  return stats;
}

export async function calculateTotalTokens(organizationId: string, startDate?: string, endDate?: string) {
  const db = useDb();

  const conditions = [eq(messages.role, 'assistant')];

  if (startDate && endDate) {
    conditions.push(
      sql`${messages.timestamp} >= ${startDate}`,
      sql`${messages.timestamp} <= ${endDate}`
    );
  }

  const result = await db
    .select({ total: count() })
    .from(messages)
    .where(and(...conditions));

  return result[0]?.total || 0;
}

export async function getTopAgents(organizationId: string, limit = 10) {
  const db = useDb();

  const stats = await db.query.agentStats.findMany({
    where: eq(agentStats.organizationId, organizationId),
    orderBy: (agentStats) => [desc(agentStats.usageCount)],
    limit,
  });

  return stats;
}

export async function getDailyUsage(organizationId: string, days = 30) {
  const db = useDb();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await db.query.usageStats.findMany({
    where: and(
      eq(usageStats.organizationId, organizationId),
      sql`${usageStats.date} >= ${startDate.toISOString().split('T')[0]}`,
    ),
    orderBy: (usageStats) => [usageStats.date],
  });

  return stats;
}
