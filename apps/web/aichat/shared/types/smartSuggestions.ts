export interface SmartSuggestion {
  id: string;
  type: 'action' | 'question' | 'command' | 'shortcut';
  label: string;
  description?: string;
  icon?: string;
  action: () => void;
  context: 'message' | 'conversation' | 'global';
  priority: number;
  enabled: boolean;
}

export interface SuggestionBarConfig {
  position: 'top' | 'bottom' | 'floating';
  maxSuggestions: number;
  autoHide: boolean;
  showIcons: boolean;
  categories: string[];
}

export interface ContextualSuggestion {
  messageId: string;
  suggestions: SmartSuggestion[];
  generatedAt: Date | string;
}
