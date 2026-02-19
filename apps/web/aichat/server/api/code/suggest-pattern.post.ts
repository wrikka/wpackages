import { defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { designPatternSuggestions, messages } from '~/server/database/schema';
import { db } from '~/server/utils/db';

// Mock analysis function
const suggestPattern = (problem: string) => {
  const lowerProblem = problem.toLowerCase();
  if (lowerProblem.includes('create objects') || lowerProblem.includes('instantiate')) {
    return {
      patternName: 'Factory Pattern',
      description:
        'The Factory Pattern provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.',
      exampleCode:
        `class CarFactory {\n  createCar(type) {\n    if (type === 'sedan') return new Sedan();\n    if (type === 'suv') return new SUV();\n  }\n}`,
    };
  } else if (
    lowerProblem.includes('one instance') || lowerProblem.includes('single point of access')
  ) {
    return {
      patternName: 'Singleton Pattern',
      description:
        'The Singleton Pattern ensures a class only has one instance, and provides a global point of access to it.',
      exampleCode:
        `class Database {\n  static instance;\n  constructor() {\n    if (!Database.instance) {\n      Database.instance = this;\n    }\n    return Database.instance;\n  }\n}`,
    };
  } else if (
    lowerProblem.includes('notify multiple objects') || lowerProblem.includes('state changes')
  ) {
    return {
      patternName: 'Observer Pattern',
      description:
        'The Observer Pattern defines a subscription mechanism to notify multiple objects about any events that happen to the object they are observing.',
      exampleCode:
        `class Subject {\n  constructor() { this.observers = []; }\n  subscribe(observer) { this.observers.push(observer); }\n  notify(data) { this.observers.forEach(o => o.update(data)); }\n}`,
    };
  } else {
    return {
      patternName: 'Strategy Pattern',
      description:
        'The Strategy Pattern enables selecting an algorithm at runtime. Instead of implementing a single algorithm directly, code receives run-time instructions as to which in a family of algorithms to use.',
      exampleCode:
        `class Context {\n  constructor(strategy) { this.strategy = strategy; }\n  executeStrategy(a, b) { return this.strategy.execute(a, b); }\n}`,
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

  const suggestion = suggestPattern(problemDescription);
  const userMessage = await db.query.messages.findFirst({
    where: (messages, { eq }) => eq(messages.content, `/pattern ${problemDescription}`),
    orderBy: (messages, { desc }) => [desc(messages.createdAt)],
  });

  // 1. Save the suggestion
  const newSuggestion = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    problemDescription,
    ...suggestion,
    createdAt: new Date(),
  };
  await db.insert(designPatternSuggestions).values(newSuggestion);

  // 2. Create a summary message for the chat
  const summaryContent = {
    type: 'design_pattern_summary',
    ...newSuggestion,
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
