import { eq, inArray } from 'drizzle-orm';
import { getOpenAIClient } from '../../../services/llm/openai';

import { useDb } from '../../../composables';
import { fileChunks, knowledgeBaseFiles } from '../../../db';

// Simple cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < len; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const kbId = getRouterParam(event, 'id');
  if (!kbId) {
    throw createError({ statusCode: 400, statusMessage: 'Knowledge Base ID is required' });
  }

  const body = await readBody(event);
  const { query } = body;
  if (!query) {
    throw createError({ statusCode: 400, statusMessage: 'Query is required' });
  }

  const db = useDb();

  // 1. Get embedding for the query
  const openai = getOpenAIClient();
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0]?.embedding;
  if (!queryEmbedding) {
    return [];
  }

  // 2. Find all files in the knowledge base
  const files = await db.query.knowledgeBaseFiles.findMany({
    where: eq(knowledgeBaseFiles.knowledgeBaseId, kbId),
  });

  if (files.length === 0) {
    return [];
  }

  // 3. Get all chunks for those files
  const chunks = await db.query.fileChunks.findMany({
    where: inArray(fileChunks.fileId, files.map(f => f.id)),
  });

  // 4. Calculate similarity and find top N chunks
  const similarities = chunks.map((chunk) => {
    const embeddingRaw = (chunk as any).embedding;
    const embedding = Array.isArray(embeddingRaw)
      ? embeddingRaw
      : (typeof embeddingRaw === 'string' ? JSON.parse(embeddingRaw) : embeddingRaw);
    return {
      ...chunk,
      similarity: cosineSimilarity(queryEmbedding, embedding as number[]),
    };
  });

  const sortedChunks = similarities.sort((a, b) => b.similarity - a.similarity);
  const topN = sortedChunks.slice(0, 5); // Get top 5 most relevant chunks

  return topN.map(chunk => ({
    content: chunk.content,
    score: chunk.similarity,
  }));
});
