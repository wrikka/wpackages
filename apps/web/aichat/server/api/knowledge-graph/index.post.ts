import { eq, and } from 'drizzle-orm';
import { knowledgeGraphNodes, knowledgeGraphEdges } from '../../db';
import { createApiHandler, validateRequiredFields, createSuccessResponse } from '../../utils/api-helpers';

export default createApiHandler(async ({ db }, event) => {
  const body = await readBody(event);
  const { knowledgeBaseId, nodes, edges } = body;

  validateRequiredFields(body, ['knowledgeBaseId', 'nodes', 'edges']);

  for (const node of nodes) {
    await db.insert(knowledgeGraphNodes).values({
      id: node.id,
      knowledgeBaseId,
      type: node.type,
      name: node.name,
      properties: node.properties,
      embedding: node.embedding,
      createdAt: new Date(),
    });
  }

  for (const edge of edges) {
    await db.insert(knowledgeGraphEdges).values({
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      targetNodeId: edge.targetNodeId,
      relation: edge.relation,
      weight: edge.weight || 1,
      createdAt: new Date(),
    });
  }

  return createSuccessResponse({
    success: true,
    nodesAdded: nodes.length,
    edgesAdded: edges.length,
  });
});
