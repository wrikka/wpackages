// This endpoint will provide a list of available AI models grouped by provider.

const availableModels = [
  {
    provider: 'openai',
    group: 'OpenAI',
    models: [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ],
  },
  // TODO: Add other providers like Anthropic, Ollama, Groq
];

export default defineEventHandler(() => {
  // In a real application, this could be dynamic based on user subscriptions,
  // available API keys, or a central configuration.
  return availableModels;
});
