export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceTranscript {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export interface VoiceSettings {
  enabled: boolean;
  inputLanguage: string;
  outputVoice: string;
  outputSpeed: number;
  autoPlayResponses: boolean;
  silenceTimeout: number;
}

export interface VoiceRecording {
  id: string;
  sessionId?: string;
  blob: Blob;
  duration: number;
  transcript: string;
  createdAt: Date | string;
}

export interface VoiceActivity {
  isListening: boolean;
  isSpeaking: boolean;
  volume: number;
  transcript: string;
  interimTranscript: string;
}
