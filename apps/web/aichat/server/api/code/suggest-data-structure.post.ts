import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { dataStructureSuggestions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock data structure suggester
const suggestDataStructure = (description: string) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('fast lookups') || lowerDesc.includes('key-value')) {
    return {
      suggestedStructure: 'Hash Map (or Dictionary/Object)',
      pros: [
        'O(1) average time complexity for insertions, deletions, and lookups.',
        'Flexible keys and values.',
      ],
      cons: ['Unordered.', 'Can have O(n) worst-case time complexity with many hash collisions.'],
      codeExample:
        `const userScores = new Map<string, number>();\nuserScores.set('alice', 100);\nuserScores.set('bob', 95);\nconsole.log(userScores.get('alice')); // 100`,
    };
  } else if (lowerDesc.includes('ordered collection') || lowerDesc.includes('sequence')) {
    return {
      suggestedStructure: 'Array (or List)',
      pros: ['Maintains order of elements.', 'O(1) access time with index.'],
      cons: ['O(n) for insertions/deletions in the middle.', 'Fixed size in some languages.'],
      codeExample:
        `const shoppingList = ['apples', 'bread', 'milk'];\nshoppingList.push('eggs');\nconsole.log(shoppingList[1]); // 'bread'`,
    };
  } else {
    return {
      suggestedStructure: 'Linked List',
      pros: ['Efficient O(1) insertions and deletions at any point.', 'Dynamic size.'],
      cons: [
        'O(n) access time as you must traverse the list.',
        'Higher memory overhead than arrays.',
      ],
      codeExample:
        `class Node {\n  constructor(data) { this.data = data; this.next = null; }\n}\n// Implementation follows...`,
    };
  }
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, problemDescription } = body;

  if (!conversationId || !problemDescription) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Conversation ID and problem description are required',
    });
  }

  const suggestion = suggestDataStructure(problemDescription);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/data-structure ${problemDescription}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the suggestion
  const newSuggestion = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    problemDescription,
    ...suggestion,
    pros: JSON.stringify(suggestion.pros),
    cons: JSON.stringify(suggestion.cons),
    createdAt: new Date(),
  };
  await db.insert(dataStructureSuggestions).values(newSuggestion);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'data_structure_summary',
    ...suggestion,
    problemDescription,
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
