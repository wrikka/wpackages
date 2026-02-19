import { onUnmounted, ref } from 'vue';

export function useSpeechRecognition(onResult: (transcript: string) => void) {
  const isListening = ref(false);
  const error = ref<string | null>(null);

  // Check if running on client-side
  if (!import.meta.client) {
    error.value = 'Speech recognition is only available on client-side.';
    return { isListening, error, start: () => void 0, stop: () => void 0 };
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    error.value = 'Speech recognition is not supported in this browser.';
    return { isListening, error, start: () => void 0, stop: () => void 0 };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening.value = true;
  };

  recognition.onend = () => {
    isListening.value = false;
  };

  recognition.onerror = (event: any) => {
    error.value = `Speech recognition error: ${event?.error ?? 'unknown'}`;
    isListening.value = false;
  };

  recognition.onresult = (event: any) => {
    const transcript = Array.from(event.results as any[])
      .map((result: any) => result[0])
      .map((result: any) => result.transcript)
      .join('');

    if (event.results[event.results.length - 1].isFinal) {
      onResult(transcript);
    }
  };

  function start() {
    if (isListening.value) return;
    try {
      recognition.start();
    } catch (e) {
      error.value = `Could not start recognition: ${e}`;
    }
  }

  function stop() {
    if (!isListening.value) return;
    recognition.stop();
  }

  onUnmounted(() => {
    recognition.abort();
  });

  return { isListening, error, start, stop };
}
