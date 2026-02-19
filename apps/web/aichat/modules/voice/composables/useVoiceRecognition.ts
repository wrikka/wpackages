import { ref, computed, onUnmounted } from 'vue';

export interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
}

export interface VoiceRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export function useVoiceRecognition(options: VoiceRecognitionOptions = {}) {
  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    maxAlternatives = 1,
  } = options;

  const isListening = ref(false);
  const transcript = ref('');
  const interimTranscript = ref('');
  const error = ref<string | null>(null);
  const recognition = ref<SpeechRecognition | null>(null);

  const isSupported = computed(() => {
    return typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  });

  const start = () => {
    if (!isSupported.value) {
      error.value = 'Speech recognition is not supported in this browser';
      return;
    }

    if (isListening.value) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition.value = new SpeechRecognition();
    recognition.value.continuous = continuous;
    recognition.value.interimResults = interimResults;
    recognition.value.lang = lang;
    recognition.value.maxAlternatives = maxAlternatives;

    recognition.value.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      transcript.value = final;
      interimTranscript.value = interim;
    };

    recognition.value.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      error.value = event.error;
      isListening.value = false;
    };

    recognition.value.onend = () => {
      isListening.value = false;
    };

    recognition.value.onstart = () => {
      isListening.value = true;
      error.value = null;
    };

    recognition.value.start();
  };

  const stop = () => {
    if (recognition.value) {
      recognition.value.stop();
      isListening.value = false;
    }
  };

  const reset = () => {
    transcript.value = '';
    interimTranscript.value = '';
    error.value = null;
  };

  onUnmounted(() => {
    if (recognition.value) {
      recognition.value.stop();
    }
  });

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
  };
}
