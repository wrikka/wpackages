import { desc, eq } from 'drizzle-orm';
import OpenAI from 'openai';
import { z } from 'zod';
import { generatedImages } from '../../database/schema/features';

const generateSchema = z.object({
  prompt: z.string().min(1),
  model: z.enum(['dall-e-3', 'dall-e-2']).default('dall-e-3'),
  size: z.enum(['1024x1024', '1024x1792', '1792x1024']).default('1024x1024'),
  quality: z.enum(['standard', 'hd']).default('standard'),
  style: z.enum(['vivid', 'natural']).default('vivid'),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const method = event.method;
  const db = useDb();

  if (method === 'GET') {
    const images = await db.query.generatedImages.findMany({
      where: eq(generatedImages.userId, user.id),
      orderBy: (gi, { desc }) => [desc(gi.createdAt)],
      limit: 50,
    });
    return images;
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const data = generateSchema.parse(body);

    const config = useRuntimeConfig();
    const openai = new OpenAI({ apiKey: config.openaiApiKey });

    const response = await openai.images.generate({
      model: data.model,
      prompt: data.prompt,
      n: 1,
      size: data.size,
      quality: data.quality,
      style: data.style,
    });

    const image = response.data[0];

    const saved = await db.insert(generatedImages).values({
      userId: user.id,
      prompt: data.prompt,
      model: data.model,
      size: data.size,
      quality: data.quality,
      style: data.style,
      url: image.url,
      revisedPrompt: image.revised_prompt,
    }).returning();

    return saved[0];
  }
});
