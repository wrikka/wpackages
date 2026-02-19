// Voice-related types

export interface VoiceCommand {
  id: string
  phrase: string
  action: string
  description?: string
  enabled: boolean
}

export interface VoiceSettings {
  language: string
  accent: string
  rate: number
  pitch: number
  volume: number
  continuous: boolean
  interimResults: boolean
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: Array<{
    transcript: string
    confidence: number
  }>
}

export interface VoiceState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  lastCommand?: VoiceCommand
  error: string | null
  settings: VoiceSettings
}

export interface VoicePermission {
  name: string
  granted: boolean
  canRequest: boolean
}
