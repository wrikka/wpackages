export interface ReadingMode {
  isActive: boolean;
  focusedMessageId: string | null;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  width: 'narrow' | 'medium' | 'wide';
  theme: 'light' | 'dark' | 'sepia';
  showTimestamps: boolean;
  showAvatars: boolean;
}

export interface ReadingModeSettings {
  autoActivate: boolean;
  autoActivateDelay: number;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
}
