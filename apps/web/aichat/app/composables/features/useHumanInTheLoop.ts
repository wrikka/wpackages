import { computed } from 'vue';
import { usePromptStore } from '~/stores/promptStore';

export function useHumanInTheLoop() {
  const store = usePromptStore();

  // A function to easily trigger a prompt for testing purposes
  const triggerTestPrompt = async () => {
    console.log('Triggering test prompt...');
    const response = await store.addRequest({
      question: 'Two files named \'report.pdf\' were found. Which one should be used?',
      context: 'Preparing to email the quarterly report.',
      options: ['The one in Downloads folder', 'The one on the Desktop'],
    });
    console.log('User selected:', response.selectedOption);
  };

  return {
    currentRequest: computed(() => store.currentRequest),
    triggerTestPrompt,
  };
}
