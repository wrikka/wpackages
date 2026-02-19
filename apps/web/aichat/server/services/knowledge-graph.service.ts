import { eq, and, sql } from 'drizzle-orm';
import { knowledgeGraphNodes, knowledgeGraphEdges } from '../db';
import { knowledgeGraphSchema } from '../utils/validation-schemas';

export async function createKnowledgeGraph(data: any) {
  const db = useDb();
  const validated = knowledgeGraphSchema.parse(data);

  const { knowledgeBaseId, nodes, edges } = validated;

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

  return {
    success: true,
    nodesAdded: nodes.length,
    edgesAdded: edges.length,
  };
}

export async function getKnowledgeGraph(knowledgeBaseId: string) {
  const db = useDb();

  const nodes = await db.query.knowledgeGraphNodes.findMany({
    where: eq(knowledgeGraphNodes.knowledgeBaseId, knowledgeBaseId),
  });

  const edges = await db.query.knowledgeGraphEdges.findMany({
    where: sql`${knowledgeGraphEdges.sourceNodeId} IN (SELECT id FROM knowledge_graph_nodes WHERE knowledge_base_id = ${knowledgeBaseId})`,
  });

  return { nodes, edges };
}

export async function searchKnowledgeGraph(knowledgeBaseId: string, searchTerm: string) {
  const db = useDb();

  const nodes = await db.query.knowledgeGraphNodes.findMany({
    where: and(
      eq(knowledgeGraphNodes.knowledgeBaseId, knowledgeBaseId),
      sql`LOWER(${knowledgeGraphNodes.name}) LIKE LOWER(${`%${searchTerm}%`})`,
    ),
  });

  return nodes;
}
