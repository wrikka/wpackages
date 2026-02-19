import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, researchSources, researchTopics } from '~/server/database/schema';
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

  // 1. Create a new research topic record
  const newTopic = {
    id: uuidv4(),
    conversationId,
    topic,
    status: 'in_progress' as const,
    createdAt: new Date(),
  };
  await db.insert(researchTopics).values(newTopic);

  // 2. Simulate finding sources (Mock Data)
  const mockSources = [
    {
      id: uuidv4(),
      topicId: newTopic.id,
      url: `https://en.wikipedia.org/wiki/${topic.replace(/ /g, '_')}`,
      title: `Wikipedia: ${topic}`,
      summary: 'A comprehensive overview from Wikipedia.',
      credibility: 85,
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: newTopic.id,
      url: `https://www.google.com/search?q=${topic.replace(/ /g, '+')}`,
      title: `Google Search: ${topic}`,
      summary: 'Primary search results.',
      credibility: 70,
      createdAt: new Date(),
    },
    {
      id: uuidv4(),
      topicId: newTopic.id,
      url: 'https://www.youtube.com/results?search_query=' + topic.replace(/ /g, '+'),
      title: `YouTube: ${topic}`,
      summary: 'Relevant videos on the topic.',
      credibility: 60,
      createdAt: new Date(),
    },
  ];
  await db.insert(researchSources).values(mockSources);

  // 3. Update topic status to completed
  await db.update(researchTopics).set({ status: 'completed' }).where({ id: newTopic.id });

  // 4. Create a summary message to be sent back to the chat
  const summaryContent = {
    type: 'research_summary',
    topic: newTopic.topic,
    sources: mockSources.map(s => ({ id: s.id, title: s.title, url: s.url, summary: s.summary })),
  };

  const assistantMessage = {
    id: uuidv4(),
    conversationId,
    role: 'assistant' as const,
    content: JSON.stringify(summaryContent), // Store structured data as JSON string
    createdAt: new Date(),
  };
  await db.insert(messages).values(assistantMessage);

  return assistantMessage;
});
