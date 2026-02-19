export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

export interface ChatInputState {
  message: string;
  files: FileAttachment[];
  isLoading: boolean;
  isDisabled: boolean;
}

export interface ChatInputEmits {
  send: [payload: {
    message: string;
    files: File[];
    mode: import('./common').ChatMode;
    model: string;
    systemPrompt?: string | null;
  }];
  stop: [];
  'update:mode': [mode: string];
  'update:model': [model: string];
  'update:value': [value: string];
}

export interface ChatInputProps {
  mode?: string;
  model?: string;
  value?: string;
  disabled?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  insert: string;
  icon?: string;
  category?: string;
}

export interface MenuState {
  isOpen: boolean;
  type: 'emoji' | 'command' | 'template' | 'variable';
  query: string;
  items: MenuItem[];
}
