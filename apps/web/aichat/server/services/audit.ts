import { nanoid } from 'nanoid';

import { auditLogs, createDbClient } from '../db';

interface AuditLogOptions {
  action: string;
  actorId: string;
  details?: Record<string, any>;
  organizationId: string;
  targetId: string;
  targetType: string;
}

export const logAuditEvent = async (options: AuditLogOptions) => {
  const db = await createDbClient();
  const { action, actorId, details, organizationId, targetId, targetType } = options;

  await db.insert(auditLogs).values({
    action,
    actorId,
    details,
    id: `al_${nanoid()}`,
    organizationId,
    targetId,
    targetType,
    timestamp: new Date(),
  });
};
