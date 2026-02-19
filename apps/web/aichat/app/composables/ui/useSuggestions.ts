import { onMounted } from 'vue';
import { useSuggestionStore } from '~/stores/suggestionStore';

export function useSuggestions() {
  const store = useSuggestionStore();

  // For demonstration, queue a suggestion after a delay
  onMounted(() => {
    setTimeout(() => {
      store.queueSuggestion({
        text:
          'It looks like you copy data from Excel to your weekly report every Friday. Would you like me to automate this for you?',
        action: { type: 'create_workflow', details: '...' },
      });
    }, 5000);
  });

  return {
    currentSuggestion: computed(() => store.currentSuggestion),
    queueSuggestion: store.queueSuggestion,
  };
}
