export interface ChatMinimap {
  isOpen: boolean;
  zoom: number;
  messages: MinimapMessage[];
  viewport: { top: number; height: number };
  highlights: MinimapHighlight[];
}

export interface MinimapMessage {
  id: string;
  role: 'user' | 'assistant';
  y: number;
  height: number;
  color: string;
}

export interface MinimapHighlight {
  type: 'search' | 'pin' | 'bookmark' | 'error';
  messageId: string;
  color: string;
}
