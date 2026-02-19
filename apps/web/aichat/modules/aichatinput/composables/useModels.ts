export function useModels() {
  const availableModels = computed(() => [
    {
      group: 'OpenAI',
      models: [
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      ],
    },
    // TODO: Add other providers like Anthropic, Google Gemini, Ollama
  ]);

  const defaultModel = computed(() =>
    availableModels.value.at(0)?.models.at(0)?.id ?? 'gpt-3.5-turbo'
  );

  return {
    availableModels,
    defaultModel: defaultModel.value,
  };
}
