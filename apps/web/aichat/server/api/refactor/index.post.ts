import { OpenAI } from 'openai';
import { z } from 'zod';

import { requireAuth, requireOrg } from '../../composables';
import { logAuditEvent } from '../../services/audit';

const bodySchema = z.object({
  code: z.string().min(1, 'Code snippet is required'),
  language: z.string().optional().default('typescript'),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);
  const { code, language } = await readValidatedBody(event, bodySchema.parse);

  const { openaiApiKey } = useRuntimeConfig();
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const systemPrompt =
    `You are an expert software developer specializing in code refactoring. Your task is to analyze the following ${language} code snippet and provide specific, actionable refactoring suggestions. Focus on improving readability, performance, and adherence to best practices. Return only the refactored code, wrapped in a markdown code block, without any additional explanation or commentary.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: code },
    ],
  });

  const suggestedCode = completion.choices[0].message.content;

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: 'code.refactor',
    targetType: 'refactoring',
    details: { language },
  });

  return {
    suggestion: suggestedCode,
  };
});
