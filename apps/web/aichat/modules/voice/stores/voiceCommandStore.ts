import { defineStore } from 'pinia';
import type { VoiceStatus } from '~/shared/types/voice';

interface VoiceCommandState {
  status: VoiceStatus;
  transcript: string;
  error: string | null;
}

export const useVoiceCommandStore = defineStore('voiceCommand', {
  state: (): VoiceCommandState => ({
    status: 'idle',
    transcript: '',
    error: null,
  }),
  actions: {
    startListening() {
      this.status = 'listening';
      this.transcript = '';
      this.error = null;
      console.log('Voice listening started...');
      // Mock processing
      setTimeout(() => {
        if (this.status === 'listening') {
          this.status = 'processing';
          setTimeout(() => {
            if (this.status === 'processing') {
              this.transcript = 'This is a mock transcript.';
              this.status = 'idle';
              console.log('Voice processing finished.');
            }
          }, 1500);
        }
      }, 3000);
    },
    stopListening() {
      if (this.status === 'listening') {
        this.status = 'processing';
        // Simulate processing after manual stop
        setTimeout(() => {
          this.transcript = 'Stopped listening.';
          this.status = 'idle';
        }, 500);
      }
    },
    setError(errorMessage: string) {
      this.status = 'idle';
      this.error = errorMessage;
    },
  },
});
