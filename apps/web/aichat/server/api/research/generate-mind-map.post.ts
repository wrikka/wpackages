import { eq } from 'drizzle-orm';
import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, mindMapNodes, researchTopics } from '~/server/database/schema';
import { db } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, topic } = body;

  if (!conversationId || !topic) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and topic are required',
    });
  }

  // 1. Find or create the research topic
  let topicRecord = await db.query.researchTopics.findFirst({
    where: eq(researchTopics.topic, topic),
  });
  if (!topicRecord) {
    topicRecord = {
      id: uuidv4(),
      conversationId,
      topic,
      status: 'completed' as const,
      createdAt: new Date(),
    };
    await db.insert(researchTopics).values(topicRecord);
  }

  // 2. Simulate generating a mind map structure
  const rootNode = {
    id: uuidv4(),
    topicId: topicRecord.id,
    parentId: null,
    label: topic,
    createdAt: new Date(),
  };
  const childNode1 = {
    id: uuidv4(),
    topicId: topicRecord.id,
    parentId: rootNode.id,
    label: 'Key Concepts',
    createdAt: new Date(),
  };
  const childNode2 = {
    id: uuidv4(),
    topicId: topicRecord.id,
    parentId: rootNode.id,
    label: 'Applications',
    createdAt: new Date(),
  };
  const grandChildNode1 = {
    id: uuidv4(),
    topicId: topicRecord.id,
    parentId: childNode1.id,
    label: 'Concept A',
    createdAt: new Date(),
  };
  const grandChildNode2 = {
    id: uuidv4(),
    topicId: topicRecord.id,
    parentId: childNode2.id,
    label: 'Application X',
    createdAt: new Date(),
  };

  const allNodes = [rootNode, childNode1, childNode2, grandChildNode1, grandChildNode2];
  await db.insert(mindMapNodes).values(allNodes);

  // 3. Create a summary message for the chat
  const summaryContent = {
    type: 'mind_map_summary',
    topic: topicRecord.topic,
    nodes: allNodes.map(n => ({ id: n.id, parentId: n.parentId, label: n.label })),
  };

  const assistantMessage = {
    id: uuidv4(),
    conversationId,
    role: 'assistant' as const,
    content: JSON.stringify(summaryContent),
    createdAt: new Date(),
  };
  await db.insert(messages).values(assistantMessage);

  return assistantMessage;
});
