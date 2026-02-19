import { computed } from 'vue';
import { useVoiceCommandStore } from '~/stores/voiceCommandStore';

export function useVoiceCommands() {
  const store = useVoiceCommandStore();

  // In a real app, this would use the Web Speech API or a similar library
  // to handle microphone input and speech-to-text conversion.

  return {
    status: computed(() => store.status),
    transcript: computed(() => store.transcript),
    error: computed(() => store.error),
    startListening: store.startListening,
    stopListening: store.stopListening,
  };
}
