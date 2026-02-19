import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { argumentMaps, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock argument mapping function
const mapArgument = (text: string) => {
  // In a real scenario, this would involve complex NLP.
  const conclusion = 'Therefore, renewable energy is the most viable long-term solution.';
  const premises = [
    'Fossil fuels are a finite resource and contribute to climate change.',
    'Renewable energy sources like solar and wind are becoming increasingly cost-effective.',
    'Technological advancements are improving energy storage solutions.',
  ];
  const structure = 'Inductive';
  return { conclusion, premises, structure };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, text } = body;

  if (!conversationId || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and text to analyze are required',
    });
  }

  const argumentData = mapArgument(text);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/map-argument ${text}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the argument map
  const newArgumentMap = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    ...argumentData,
    premises: JSON.stringify(argumentData.premises),
    createdAt: new Date(),
  };
  await db.insert(argumentMaps).values(newArgumentMap);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'argument_map_summary',
    ...argumentData,
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
