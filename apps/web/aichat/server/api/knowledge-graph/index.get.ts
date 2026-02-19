import { eq } from 'drizzle-orm';
import { knowledgeGraphNodes, knowledgeGraphEdges } from '../../db';
import { createApiHandler, parseQueryParams, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const { knowledgeBaseId } = parseQueryParams(event, {
    knowledgeBaseId: 'string',
  });

  if (!knowledgeBaseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'knowledgeBaseId is required',
    });
  }

  const nodes = await db.query.knowledgeGraphNodes.findMany({
    where: eq(knowledgeGraphNodes.knowledgeBaseId, knowledgeBaseId),
  });

  const edges = await db.query.knowledgeGraphEdges.findMany({
    where: (knowledgeGraphEdges) =>
      sql`${knowledgeGraphEdges.sourceNodeId} IN (SELECT id FROM knowledge_graph_nodes WHERE knowledge_base_id = ${knowledgeBaseId})`,
  });

  return createSuccessResponse({ nodes, edges });
});
