export const useCodeRefactor = () => {
  const isModalOpen = ref(false);
  const originalCode = ref('');
  const suggestedCode = ref('');
  const isLoading = ref(false);
  const toast = useToast();

  const getRefactoringSuggestion = async (code: string, language: string = 'typescript') => {
    if (!code.trim()) return;

    originalCode.value = code;
    isLoading.value = true;
    isModalOpen.value = true;
    suggestedCode.value = '';

    try {
      const result = await $fetch('/api/refactor', {
        method: 'POST',
        body: { code, language },
      });
      suggestedCode.value = result.suggestion || 'No suggestions available.';
    } catch (_error) {
      toast.add({
        color: 'red',
        title: 'Error',
        description: 'Failed to get refactoring suggestions.',
      });
      suggestedCode.value = 'Sorry, an error occurred while generating suggestions.';
    } finally {
      isLoading.value = false;
    }
  };

  const acceptedSuggestion = ref<string | null>(null);

  const applySuggestion = (suggestion: string) => {
    acceptedSuggestion.value = suggestion;
    isModalOpen.value = false;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  return {
    isModalOpen,
    originalCode,
    suggestedCode,
    isLoading,
    acceptedSuggestion,
    getRefactoringSuggestion,
    applySuggestion,
    closeModal,
  };
};
