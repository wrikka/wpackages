export interface CommandSuggestion {
  id: number | string;
  title: string;
  category: string;
  icon?: string; // e.g., Tabler icon name
  action: () => void;
}

export interface CommandContext {
  activeApp?: string;
  activeUrl?: string;
  selectedText?: string;
}

export interface CommandExecutionResult {
  success: boolean;
  message?: string;
  data?: any;
}
