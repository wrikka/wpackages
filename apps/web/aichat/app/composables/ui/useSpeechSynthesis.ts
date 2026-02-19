import { onUnmounted, ref } from 'vue';

export function useSpeechSynthesis(text: string) {
  const isPlaying = ref(false);
  const error = ref<string | null>(null);

  if (!import.meta.client) {
    error.value = 'Speech synthesis is only available on client-side.';
    return { isPlaying, error, play: () => void 0, stop: () => void 0 };
  }

  if (!('speechSynthesis' in window)) {
    error.value = 'Speech synthesis is not supported in this browser.';
    return { isPlaying, error, play: () => void 0, stop: () => void 0 };
  }

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    isPlaying.value = true;
  };

  utterance.onend = () => {
    isPlaying.value = false;
  };

  utterance.onerror = (event) => {
    error.value = `Speech synthesis error: ${event.error}`;
    isPlaying.value = false;
  };

  function play() {
    if (isPlaying.value) return;
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (!isPlaying.value) return;
    window.speechSynthesis.cancel();
  }

  onUnmounted(() => {
    window.speechSynthesis.cancel();
  });

  return { isPlaying, error, play, stop };
}
