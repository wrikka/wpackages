export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard', n = 1 } = body;

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required',
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        quality,
        n,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: data.error?.message || 'Failed to generate image',
      });
    }

    return data;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate image',
    });
  }
});
