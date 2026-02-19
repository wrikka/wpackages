import { generateId } from 'lucia';
import { mcpServers } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db, org, user }, event) => {
  const body = await readBody(event);
  const { name, endpoint, transport = 'stdio', command, args, env } = body;

  validateRequiredFields(body, ['name', 'endpoint']);

  const server = {
    id: generateId(15),
    organizationId: org.id,
    name,
    endpoint,
    transport,
    command,
    args,
    env,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(mcpServers).values(server);

  return createSuccessResponse(server);
});
