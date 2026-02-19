import { createError, defineEventHandler, readBody } from 'h3';
import { v4 as uuidv4 } from 'uuid';
import { messages, studyPlans } from '~/server/database/schema';
import { db } from '~/server/utils/db';

const buildPlan = (goal: string, durationDays: number) => {
  const days = Math.max(1, Math.min(90, durationDays));
  const weekCount = Math.ceil(days / 7);
  const plan = Array.from({ length: weekCount }).map((_, i) => ({
    week: i + 1,
    focus: i === 0 ? 'Fundamentals' : i === weekCount - 1 ? 'Capstone' : 'Practice',
    tasks: [
      `Read notes about ${goal}`,
      'Do 3 practice exercises',
      'Write a short summary of what you learned',
    ],
  }));
  return plan;
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { conversationId, goal, durationDays } = body as {
    conversationId?: string;
    goal?: string;
    durationDays?: number;
  };

  if (!conversationId || !goal || typeof durationDays !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: 'conversationId, goal, and durationDays are required',
    });
  }

  const plan = buildPlan(goal, durationDays);

  const userMessage = await db.query.messages.findFirst({
    where: (m, { eq }) => eq(m.content, `/study-plan ${goal}`),
    orderBy: (m, { desc }) => [desc(m.createdAt)],
  });

  const row = {
    id: uuidv4(),
    messageId: userMessage ? userMessage.id : '',
    goal,
    durationDays,
    plan,
    createdAt: new Date(),
  };

  await db.insert(studyPlans).values(row);

  const summaryContent = { type: 'study_plan_summary', goal, durationDays, plan };

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
