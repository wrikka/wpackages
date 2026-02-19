export type RecorderStatus = 'idle' | 'recording' | 'paused';

export type RecordedActionType = 'Click' | 'Type' | 'KeyPress' | 'Navigate' | 'Scroll' | 'Wait';

export interface RecordedAction {
  id: string;
  timestamp: number; // Milliseconds from start of recording
  type: RecordedActionType;
  details: string; // Human-readable description
  targetSelector?: string; // e.g., CSS selector, XPath
  value?: string; // e.g., text that was typed
}
