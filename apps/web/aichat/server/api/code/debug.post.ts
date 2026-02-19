import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { debuggingSessions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock analysis function
const analyzeError = (errorMessage: string, stackTrace?: string) => {
  let analysis = 'An unknown error occurred.';
  let suggestedFix = 'Check the browser console and server logs for more details.';

  if (errorMessage.toLowerCase().includes('typeerror')) {
    analysis =
      'This is a TypeError, which usually means you are trying to access a property or call a method on an undefined or null object.';
    suggestedFix =
      'Ensure the object is initialized before you access its properties. Check for potential null values returned from functions.';
  } else if (errorMessage.toLowerCase().includes('referenceerror')) {
    analysis =
      'This is a ReferenceError, indicating that a variable is being accessed that has not been declared.';
    suggestedFix =
      'Make sure all variables are declared using `let`, `const`, or `var` before they are used.';
  } else if (stackTrace && stackTrace.toLowerCase().includes('api')) {
    analysis =
      'The error seems to originate from an API call. This could be due to a network issue, an incorrect endpoint, or invalid data being sent.';
    suggestedFix =
      'Verify the API endpoint URL, check the network tab in your browser\'s developer tools, and validate the request payload.';
  }

  return { analysis, suggestedFix };
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, errorMessage, stackTrace } = body;

  if (!conversationId || !errorMessage) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and errorMessage are required',
    });
  }

  const { analysis, suggestedFix } = analyzeError(errorMessage, stackTrace);

  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, errorMessage),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the debugging session
  const newDebuggingSession = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    errorMessage,
    stackTrace,
    analysis,
    suggestedFix,
    createdAt: new Date(),
  };
  await db.insert(debuggingSessions).values(newDebuggingSession);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'debug_summary',
    sessionId: newDebuggingSession.id,
    errorMessage,
    analysis,
    suggestedFix,
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
