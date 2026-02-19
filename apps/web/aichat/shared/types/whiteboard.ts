export interface Whiteboard {
  id: string;
  organizationId: string;
  userId: string;
  chatSessionId?: string;
  name: string;
  canvasData: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CanvasNode {
  id: string;
  type: 'text' | 'image' | 'shape' | 'drawing';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  imageUrl?: string;
  shape?: 'rectangle' | 'circle' | 'triangle' | 'diamond';
  drawing?: string;
  properties?: Record<string, any>;
}

export interface CanvasEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  style?: Record<string, any>;
}
