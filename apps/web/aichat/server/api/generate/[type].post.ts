import { OpenAI } from 'openai';
import { z } from 'zod';

import { requireAuth, requireOrg } from '../../composables';
import { logAuditEvent } from '../../services/audit';

const paramsSchema = z.object({
  type: z.enum(['blog-post', 'social-media-post']),
});

const bodySchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
});

export default defineEventHandler(async (event) => {
  const user = requireAuth(event);
  const org = requireOrg(event);
  const { type } = await getValidatedRouterParams(event, paramsSchema.parse);
  const { topic } = await readValidatedBody(event, bodySchema.parse);

  const { openaiApiKey } = useRuntimeConfig();
  const openai = new OpenAI({ apiKey: openaiApiKey });

  let systemPrompt = '';
  if (type === 'blog-post') {
    systemPrompt =
      `You are an expert blog post writer. Write a comprehensive, engaging, and well-structured blog post about the following topic: ${topic}`;
  } else if (type === 'social-media-post') {
    systemPrompt =
      `You are a social media expert. Write a short, catchy, and shareable social media post (e.g., for Twitter or LinkedIn) about the following topic: ${topic}`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'system', content: systemPrompt }],
  });

  const generatedContent = completion.choices[0].message.content;

  await logAuditEvent({
    actorId: user.id,
    organizationId: org.id,
    action: `content.generate.${type}`,
    targetType: 'generation',
    details: { topic },
  });

  return {
    content: generatedContent,
  };
});
