export interface CanvasNode {
  id: string;
  type: 'text' | 'sticky' | 'image' | 'code' | 'diagram' | 'ai-response';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CanvasEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type: 'straight' | 'curved' | 'orthogonal';
}

export interface WhiteboardSession {
  id: string;
  name: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  createdAt: Date | string;
  updatedAt: Date | string;
}
