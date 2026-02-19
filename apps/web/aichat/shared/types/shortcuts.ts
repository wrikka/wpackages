export interface KeyboardShortcut {
  id: string;
  action: string;
  description: string;
  defaultKey: string;
  currentKey: string;
  category: 'navigation' | 'chat' | 'editor' | 'general';
  isCustomizable: boolean;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  icon: string;
  shortcuts: KeyboardShortcut[];
}

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}
