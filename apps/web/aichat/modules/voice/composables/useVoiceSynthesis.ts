import { ref, computed, onUnmounted } from 'vue';

export interface VoiceSynthesisOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
}

export interface VoiceSynthesisState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  error: string | null;
}

export function useVoiceSynthesis(defaultOptions: VoiceSynthesisOptions = {}) {
  const {
    lang = 'en-US',
    pitch = 1,
    rate = 1,
    volume = 1,
  } = defaultOptions;

  const isSpeaking = ref(false);
  const isPaused = ref(false);
  const voices = ref<SpeechSynthesisVoice[]>([]);
  const error = ref<string | null>(null);
  const utterance = ref<SpeechSynthesisUtterance | null>(null);

  const isSupported = computed(() => typeof window !== 'undefined' && 'speechSynthesis' in window);

  const loadVoices = () => {
    if (!isSupported.value) return;

    const synth = window.speechSynthesis;
    voices.value = synth.getVoices();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        voices.value = synth.getVoices();
      };
    }
  };

  const speak = (text: string, options: VoiceSynthesisOptions = {}) => {
    if (!isSupported.value) {
      error.value = 'Speech synthesis is not supported in this browser';
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = options.lang || lang;
    u.pitch = options.pitch ?? pitch;
    u.rate = options.rate ?? rate;
    u.volume = options.volume ?? volume;

    if (options.voice) {
      u.voice = options.voice;
    }

    u.onstart = () => {
      isSpeaking.value = true;
      isPaused.value = false;
      error.value = null;
    };

    u.onend = () => {
      isSpeaking.value = false;
      isPaused.value = false;
    };

    u.onerror = (event) => {
      isSpeaking.value = false;
      isPaused.value = false;
      error.value = event.error;
    };

    u.onpause = () => {
      isPaused.value = true;
    };

    u.onresume = () => {
      isPaused.value = false;
    };

    utterance.value = u;
    synth.speak(u);
  };

  const pause = () => {
    if (isSupported.value) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported.value) {
      window.speechSynthesis.resume();
    }
  };

  const cancel = () => {
    if (isSupported.value) {
      window.speechSynthesis.cancel();
      isSpeaking.value = false;
      isPaused.value = false;
    }
  };

  onUnmounted(() => {
    if (isSupported.value) {
      window.speechSynthesis.cancel();
    }
  });

  loadVoices();

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    error,
    speak,
    pause,
    resume,
    cancel,
    loadVoices,
  };
}
