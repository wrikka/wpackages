import { fileChunks, knowledgeBaseFiles } from '../db/schemas';
import { eq, inArray } from 'drizzle-orm';
import { generateId } from 'lucia';
import { readFile } from 'node:fs/promises';

import { useDb } from '../composables';
import { logger } from '../utils/logger';
import { getOpenAIClient } from './llm/openai';


function chunkText(text: string, chunkSize = 1000, overlap = 100): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

async function getEmbeddings(chunks: string[]): Promise<number[][]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: chunks,
  });
  return response.data.map(d => d.embedding);
}

export async function processFile(fileId: string) {
  logger.info(`Processing file: ${fileId}`);
  const db = await useDb();

  await db.update(knowledgeBaseFiles).set({ status: 'processing' }).where(
    eq(knowledgeBaseFiles.id, fileId),
  );

  try {
    const file = await db.query.knowledgeBaseFiles.findFirst({
      where: eq(knowledgeBaseFiles.id, fileId),
    });

    if (!file) {
      throw new Error('File not found');
    }

    const content = await readFile(file.storagePath, 'utf-8');
    const chunks = chunkText(content);
    const embeddings = await getEmbeddings(chunks);

    const chunkRecords = chunks.map((chunk, index) => ({
      id: generateId(15),
      fileId,
      content: chunk,
      embedding: embeddings[index] ?? [],
    }));

    for (const record of chunkRecords) {
      await db.insert(fileChunks).values(record);
    }

    await db.update(knowledgeBaseFiles).set({ status: 'ready' }).where(
      eq(knowledgeBaseFiles.id, fileId),
    );
    logger.info(`File processed successfully: ${fileId}`);
  } catch (error) {
    logger.error('Error processing file', { fileId, error });
    await db.update(knowledgeBaseFiles).set({ status: 'error' }).where(
      eq(knowledgeBaseFiles.id, fileId),
    );
  }
}

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

export async function searchKnowledgeBase(kbId: string, query: string): Promise<string[]> {
  const openai = getOpenAIClient();
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0]?.embedding;
  if (!queryEmbedding) {
    return [];
  }

  const db = await useDb();

  const files = await db.query.knowledgeBaseFiles.findMany({
    where: eq(knowledgeBaseFiles.knowledgeBaseId, kbId),
  });

  if (files.length === 0) {
    return [];
  }

  const chunks = await db.query.fileChunks.findMany({
    where: inArray(fileChunks.fileId, files.map(f => f.id)),
  });

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
  const topN = sortedChunks.slice(0, 5);

  return topN.map(chunk => chunk.content);
}
